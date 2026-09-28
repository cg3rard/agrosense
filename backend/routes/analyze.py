import base64
import json
import logging
import mimetypes
import re
from dataclasses import dataclass
from typing import Optional

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from roi import RoiInputs, compute_roi
from schemas import AnalyzeResponse, RoiBreakdown
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum file size accepted: 10 MB
_MAX_IMAGE_BYTES = 10 * 1024 * 1024

# Fields we try to read from the LLM output.
# `roi_status` is still accepted but only kept as the model's *opinion* — the
# authoritative status is computed by roi.compute_roi().
_REQUIRED_FIELDS = ("diagnosis", "recommended_action", "cost_estimate", "roi_status")
_NUMERIC_HINT_FIELDS = ("expected_yield_loss_percent", "treatment_effectiveness_percent")
_FIELD_DEFAULTS: dict[str, str | float] = {
    "diagnosis": "Tidak diketahui",
    "recommended_action": "Konsultasikan dengan agronomis.",
    "cost_estimate": 0.0,
    "roi_status": "Neutral",
}


@dataclass
class FarmParams:
    """Parameter kebun yang dikirim penampil/petani untuk perhitungan ROI."""

    land_area_ha: Optional[float] = None
    yield_per_ha_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    yield_loss_percent: Optional[float] = None
    effectiveness_percent: Optional[float] = None


def _to_float(value: object) -> Optional[float]:
    """
    Konversi nilai bebas dari LLM menjadi float.

    Menangani "Rp 150.000", "150,000", "30%", "1.5", dan angka biasa.
    Mengembalikan None bila tidak ada digit yang bisa dibaca.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()
    # Buang simbol mata uang, satuan, dan spasi
    text = re.sub(r"(?i)(rp|idr|%|/kg|per\s*kg|kg|ha)", "", text).strip()
    text = text.replace(" ", "")
    if not re.search(r"\d", text):
        return None

    has_dot, has_comma = "." in text, "," in text
    if has_dot and has_comma:
        # Format id-ID: titik ribuan, koma desimal
        text = text.replace(".", "").replace(",", ".")
    elif has_comma:
        text = text.replace(",", "") if re.fullmatch(r"\d{1,3}(,\d{3})+", text) else text.replace(",", ".")
    elif has_dot:
        # "150.000" = ribuan, "1.5" = desimal
        if re.fullmatch(r"\d{1,3}(\.\d{3})+", text):
            text = text.replace(".", "")

    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return float(match.group()) if match else None


def _image_to_data_uri(content: bytes, mime: str) -> str:
    """Encode raw image bytes as a base64 data URI."""
    return f"data:{mime};base64,{base64.b64encode(content).decode()}"


# Diminta ke LLM sebagai tambahan — dipakai sebagai input rumus ROI.
_EXTRA_FIELD_INSTRUCTION = (
    "Sertakan juga dua angka ini pada output (angka saja, tanpa satuan): "
    "expected_yield_loss_percent = perkiraan persentase kehilangan hasil panen "
    "bila gejala ini dibiarkan tanpa tindakan; "
    "treatment_effectiveness_percent = perkiraan persentase kerugian tersebut "
    "yang dapat diselamatkan oleh recommended_action."
)


def build_langflow_payload(text: str, image_data_uri: Optional[str]) -> dict:
    """
    Build the Langflow /run payload.

    The text-based flow receives everything through `input_value`.
    When an image is present, we prepend a compact data URI so the LLM
    can reference it (works with vision-capable models in Langflow).
    If no image is provided, we send the text description alone.

    We also append a request for two extra numeric fields
    (`expected_yield_loss_percent`, `treatment_effectiveness_percent`) which
    feed the deterministic ROI formula. Both are optional — if the flow does
    not return them, roi.compute_roi() falls back to documented defaults.
    """
    if image_data_uri:
        input_value = f"[IMAGE]{image_data_uri}[/IMAGE]\n{text}"
    else:
        input_value = text

    input_value = f"{input_value}\n\n{_EXTRA_FIELD_INSTRUCTION}"

    return {
        "input_value": input_value,
        "input_type": "chat",
        "output_type": "chat",
        "tweaks": {},
    }


def _fallback_parse(text: str) -> Optional[dict]:
    """
    Attempt to extract key-value pairs from a plain-text Langflow response.

    Handles two common formats the LLM may produce when not prompted for JSON:

    Format A — colon-separated lines:
        diagnosis: Bercak Daun
        recommended_action: Semprotkan fungisida
        cost_estimate: 150000
        roi_status: Positive

    Format B — markdown bold labels:
        **diagnosis**: Bercak Daun
        **recommended_action**: Semprotkan fungisida

    Returns a dict with at least the four required keys, or None if no
    recognisable pattern is found.
    """
    result: dict[str, str] = {}
    # Match lines like "key: value" or "**key**: value" (case-insensitive)
    pattern = re.compile(
        r"^\s*\**(?P<key>diagnosis|recommended_action|cost_estimate|roi_status"
        r"|expected_yield_loss_percent|treatment_effectiveness_percent)\**\s*[:\-]\s*(?P<value>.+)$",
        re.IGNORECASE | re.MULTILINE,
    )
    for match in pattern.finditer(text):
        result[match.group("key").lower()] = match.group("value").strip()

    if not result:
        return None

    # Fill in any missing fields with sensible defaults
    for field, default in _FIELD_DEFAULTS.items():
        result.setdefault(field, str(default))

    return result


def _extract_output_text(data: dict) -> str:
    """
    Walk the standard Langflow response envelope and return the inner
    text string that the flow produced.

    Raises KeyError / IndexError if the envelope structure is unexpected.
    """
    return data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]


def build_analyze_response(parsed: dict, farm: Optional[FarmParams] = None) -> AnalyzeResponse:
    """
    Susun AnalyzeResponse dari dict hasil parsing + hitung ROI secara deterministik.

    `roi_status` dari LLM diabaikan sebagai keputusan akhir (hanya dicatat di log
    bila berbeda) — status yang dikirim ke klien selalu berasal dari
    roi.compute_roi() sehingga bisa direproduksi dari angka-angkanya.
    """
    farm = farm or FarmParams()

    try:
        cost_estimate = _to_float(parsed.get("cost_estimate")) or float(
            _FIELD_DEFAULTS["cost_estimate"]
        )
    except (ValueError, TypeError) as exc:
        logger.error("Failed to read cost_estimate from parsed dict: %s", parsed)
        raise HTTPException(
            status_code=502,
            detail=f"Invalid field types in Langflow output: {exc}",
        ) from exc

    # Parameter petani menang atas estimasi LLM; LLM dipakai bila form kosong.
    loss_percent = farm.yield_loss_percent or _to_float(
        parsed.get("expected_yield_loss_percent")
    )
    effectiveness_percent = farm.effectiveness_percent or _to_float(
        parsed.get("treatment_effectiveness_percent")
    )

    roi_result = compute_roi(
        RoiInputs(
            treatment_cost=cost_estimate,
            land_area_ha=farm.land_area_ha,
            yield_per_ha_kg=farm.yield_per_ha_kg,
            price_per_kg=farm.price_per_kg,
            yield_loss_ratio=loss_percent,
            effectiveness_ratio=effectiveness_percent,
        )
    )

    llm_opinion = str(parsed.get("roi_status", "")).strip()
    if llm_opinion and llm_opinion.lower() != roi_result.status.lower():
        logger.info(
            "ROI status overridden: LLM said %r, formula computed %r (ROI %.1f%%).",
            llm_opinion,
            roi_result.status,
            roi_result.roi_percent,
        )

    return AnalyzeResponse(
        diagnosis=str(parsed.get("diagnosis", _FIELD_DEFAULTS["diagnosis"])),
        recommended_action=str(
            parsed.get("recommended_action", _FIELD_DEFAULTS["recommended_action"])
        ),
        cost_estimate=cost_estimate,
        roi_status=roi_result.status,
        roi=RoiBreakdown(**roi_result.as_dict()),
    )


def parse_langflow_response(raw_text: str, farm: Optional[FarmParams] = None) -> AnalyzeResponse:
    """
    Parse the Langflow HTTP response body into an AnalyzeResponse.

    Strategy (in order):
    1. Guard against empty body.
    2. Parse outer Langflow JSON envelope.
    3. Try json.loads() on the inner text field (ideal path).
    4. If that fails, run _fallback_parse() on the inner text (plain-text path).
    5. If both fail, raise 502 with enough context to diagnose the issue.
    """
    # 1. Guard empty body
    if not raw_text or not raw_text.strip():
        logger.error("Langflow returned an empty response body.")
        raise HTTPException(
            status_code=502,
            detail=(
                "Langflow returned an empty response. "
                "Check that your flow ID in LANGFLOW_API_URL is correct and "
                "that the flow is deployed and enabled."
            ),
        )

    # 2. Parse outer Langflow envelope
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        logger.error("Langflow HTTP response is not valid JSON: %s", raw_text[:300])
        raise HTTPException(
            status_code=502,
            detail=f"Langflow returned non-JSON HTTP response: {raw_text[:200]}",
        ) from exc

    # Extract the inner output text
    try:
        output_text: str = _extract_output_text(data)
    except (KeyError, IndexError, TypeError) as exc:
        logger.error("Unexpected Langflow envelope structure. Raw data: %s", data)
        raise HTTPException(
            status_code=502,
            detail=(
                f"Unexpected Langflow response envelope: {exc}. "
                "Ensure your flow outputs a chat message result."
            ),
        ) from exc

    # 3. Try strict JSON parse of inner text
    parsed: Optional[dict] = None
    try:
        parsed = json.loads(output_text)
        logger.debug("Langflow output parsed as JSON successfully.")
    except (json.JSONDecodeError, TypeError):
        logger.warning(
            "Langflow output is not JSON — trying fallback line parser. Output text: %s",
            output_text[:300],
        )

    # 4. Fallback: parse plain-text key-value lines
    if parsed is None:
        parsed = _fallback_parse(output_text)
        if parsed is not None:
            logger.info("Langflow output parsed via fallback line parser.")
        else:
            logger.error(
                "All parsers failed. Langflow output text: %s", output_text[:500]
            )
            raise HTTPException(
                status_code=502,
                detail=(
                    "Could not parse Langflow output. Expected a JSON string or "
                    "key-value lines with keys: diagnosis, recommended_action, "
                    f"cost_estimate, roi_status. Got: {output_text[:200]}"
                ),
            )

    # 5. Build AnalyzeResponse — fill missing fields with defaults and compute ROI
    return build_analyze_response(parsed, farm)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    text: str = Form(..., min_length=1, description="Symptom description from the user"),
    image: Optional[UploadFile] = File(None, description="Optional crop photo (PNG/JPG/WEBP, max 10 MB)"),
    image_url: Optional[str] = Form(None, description="Optional public image URL (alternative to file upload)"),
    # ── Parameter kebun untuk perhitungan ROI (opsional, ada default) ─────────
    land_area_ha: Optional[float] = Form(None, gt=0, description="Luas lahan (ha)"),
    yield_per_ha_kg: Optional[float] = Form(None, gt=0, description="Produktivitas (kg/ha)"),
    price_per_kg: Optional[float] = Form(None, gt=0, description="Harga jual (Rp/kg)"),
    yield_loss_percent: Optional[float] = Form(
        None, gt=0, le=100, description="Perkiraan kehilangan hasil bila dibiarkan (%) — menimpa estimasi AI"
    ),
    effectiveness_percent: Optional[float] = Form(
        None, gt=0, le=100, description="Efektivitas tindakan menyelamatkan hasil (%) — menimpa estimasi AI"
    ),
):
    farm = FarmParams(
        land_area_ha=land_area_ha,
        yield_per_ha_kg=yield_per_ha_kg,
        price_per_kg=price_per_kg,
        yield_loss_percent=yield_loss_percent,
        effectiveness_percent=effectiveness_percent,
    )

    # ── Validate and read image file ─────────────────────────────────────────
    image_data_uri: Optional[str] = None

    if image and image.filename:
        content = await image.read()
        if len(content) > _MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image file exceeds 10 MB limit.")

        mime = image.content_type or mimetypes.guess_type(image.filename or "")[0] or "image/jpeg"
        if not mime.startswith("image/"):
            raise HTTPException(status_code=415, detail=f"Unsupported media type: {mime}. Only images are accepted.")

        image_data_uri = _image_to_data_uri(content, mime)
        logger.info("Image received: %s (%d bytes, %s)", image.filename, len(content), mime)

    elif image_url:
        # Caller provided a public URL — pass it as a markdown image reference
        image_data_uri = f"[IMAGE_URL]{image_url}[/IMAGE_URL]"
        logger.info("Image URL received: %s", image_url)

    # ── Build and send Langflow payload ──────────────────────────────────────
    payload = build_langflow_payload(text, image_data_uri)

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if settings.langflow_api_key:
        headers["Authorization"] = f"Bearer {settings.langflow_api_key}"

    logger.info("Calling Langflow at: %s", settings.langflow_api_url)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(settings.langflow_api_url, json=payload, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Langflow returned HTTP %s: %s",
                exc.response.status_code,
                exc.response.text[:300],
            )
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Langflow error {exc.response.status_code}: {exc.response.text[:200]}",
            ) from exc
        except httpx.RequestError as exc:
            logger.error(
                "Langflow unreachable at %s — %s: %s",
                settings.langflow_api_url,
                type(exc).__name__,
                exc,
            )
            raise HTTPException(
                status_code=503,
                detail=(
                    f"Langflow unreachable at '{settings.langflow_api_url}'. "
                    f"Error: {type(exc).__name__}: {exc}. "
                    "If running in Docker, use host.docker.internal instead of localhost."
                ),
            ) from exc

    return parse_langflow_response(response.text, farm)
