import base64
import json
import logging
import mimetypes
import re
from typing import Optional

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from schemas import AnalyzeResponse
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Maximum file size accepted: 10 MB
_MAX_IMAGE_BYTES = 10 * 1024 * 1024

# Required output fields and their defaults when a field is missing
_REQUIRED_FIELDS = ("diagnosis", "recommended_action", "cost_estimate", "roi_status")
_FIELD_DEFAULTS: dict[str, str | float] = {
    "diagnosis": "Tidak diketahui",
    "recommended_action": "Konsultasikan dengan agronomis.",
    "cost_estimate": 0.0,
    "roi_status": "Neutral",
}


def _image_to_data_uri(content: bytes, mime: str) -> str:
    """Encode raw image bytes as a base64 data URI."""
    return f"data:{mime};base64,{base64.b64encode(content).decode()}"


def build_langflow_payload(text: str, image_data_uri: Optional[str]) -> dict:
    """
    Build the Langflow /run payload.

    The text-based flow receives everything through `input_value`.
    When an image is present, we prepend a compact data URI so the LLM
    can reference it (works with vision-capable models in Langflow).
    If no image is provided, we send the text description alone.
    """
    if image_data_uri:
        input_value = f"[IMAGE]{image_data_uri}[/IMAGE]\n{text}"
    else:
        input_value = text

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
        r"^\s*\**(?P<key>diagnosis|recommended_action|cost_estimate|roi_status)\**\s*[:\-]\s*(?P<value>.+)$",
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


def parse_langflow_response(raw_text: str) -> AnalyzeResponse:
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

    # 5. Build AnalyzeResponse — fill missing fields with defaults
    try:
        return AnalyzeResponse(
            diagnosis=str(parsed.get("diagnosis", _FIELD_DEFAULTS["diagnosis"])),
            recommended_action=str(parsed.get("recommended_action", _FIELD_DEFAULTS["recommended_action"])),
            cost_estimate=float(parsed.get("cost_estimate", _FIELD_DEFAULTS["cost_estimate"])),
            roi_status=str(parsed.get("roi_status", _FIELD_DEFAULTS["roi_status"])),
        )
    except (ValueError, TypeError) as exc:
        logger.error("Failed to construct AnalyzeResponse from parsed dict: %s", parsed)
        raise HTTPException(
            status_code=502,
            detail=f"Invalid field types in Langflow output: {exc}",
        ) from exc


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    text: str = Form(..., min_length=1, description="Symptom description from the user"),
    image: Optional[UploadFile] = File(None, description="Optional crop photo (PNG/JPG/WEBP, max 10 MB)"),
    image_url: Optional[str] = Form(None, description="Optional public image URL (alternative to file upload)"),
):
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

    return parse_langflow_response(response.text)
