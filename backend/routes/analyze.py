import httpx
from fastapi import APIRouter, HTTPException
from schemas import AnalyzeRequest, AnalyzeResponse
from config import settings

router = APIRouter()


def build_langflow_payload(image_url: str, text: str) -> dict:
    return {
        "input_value": text,
        "input_type": "chat",
        "output_type": "chat",
        "tweaks": {
            "image_url": image_url,
        },
    }


def parse_langflow_response(data: dict) -> AnalyzeResponse:
    try:
        outputs = data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
        import json
        parsed = json.loads(outputs)
        return AnalyzeResponse(
            diagnosis=parsed["diagnosis"],
            recommended_action=parsed["recommended_action"],
            cost_estimate=float(parsed["cost_estimate"]),
            roi_status=parsed["roi_status"],
        )
    except (KeyError, IndexError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected Langflow response: {exc}")


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    headers = {"Content-Type": "application/json"}
    if settings.langflow_api_key:
        headers["Authorization"] = f"Bearer {settings.langflow_api_key}"

    payload = build_langflow_payload(str(request.image_url), request.text)

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(settings.langflow_api_url, json=payload, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Langflow unreachable: {exc}")

    return parse_langflow_response(response.json())
