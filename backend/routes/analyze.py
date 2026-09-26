import json
import logging

import httpx
from fastapi import APIRouter, HTTPException
from schemas import AnalyzeRequest, AnalyzeResponse
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def build_langflow_payload(image_url: str | None, text: str) -> dict:
    payload: dict = {
        "input_value": text,
        "input_type": "chat",
        "output_type": "chat",
        "tweaks": {},
    }
    if image_url:
        payload["tweaks"]["image_url"] = image_url
    return payload


def parse_langflow_response(data: dict) -> AnalyzeResponse:
    try:
        outputs = data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
        parsed = json.loads(outputs)
        return AnalyzeResponse(
            diagnosis=parsed["diagnosis"],
            recommended_action=parsed["recommended_action"],
            cost_estimate=float(parsed["cost_estimate"]),
            roi_status=parsed["roi_status"],
        )
    except (KeyError, IndexError, ValueError, TypeError) as exc:
        logger.error("Failed to parse Langflow response. Raw data: %s", data)
        raise HTTPException(status_code=502, detail=f"Unexpected Langflow response structure: {exc}")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    headers = {"Content-Type": "application/json"}
    if settings.langflow_api_key:
        headers["Authorization"] = f"Bearer {settings.langflow_api_key}"

    payload = build_langflow_payload(
        str(request.image_url) if request.image_url else None,
        request.text,
    )

    logger.info("Calling Langflow at: %s", settings.langflow_api_url)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(settings.langflow_api_url, json=payload, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "Langflow returned HTTP %s: %s",
                exc.response.status_code,
                exc.response.text[:200],
            )
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Langflow error {exc.response.status_code}: {exc.response.text[:200]}",
            )
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
            )

    return parse_langflow_response(response.json())
