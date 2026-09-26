import logging
import uuid

from fastapi import APIRouter, HTTPException, Query

from config import settings
from db import get_collection
from schemas import FinanceEntryRequest, FinanceEntryResponse

router = APIRouter()
logger = logging.getLogger(__name__)


def _collection():
    return get_collection(settings.astra_db_finance_collection)


def _to_response(doc: dict) -> FinanceEntryResponse:
    return FinanceEntryResponse(
        id=doc["_id"],
        type=doc["type"],
        item_name=doc["item_name"],
        amount=doc["amount"],
        note=doc.get("note"),
        timestamp=doc["timestamp"],
    )


@router.post("/finance", response_model=FinanceEntryResponse)
async def create_finance_entry(entry: FinanceEntryRequest):
    """Persist a single income/expense entry to Astra DB."""
    doc = {
        "_id": str(uuid.uuid4()),
        "type": entry.type,
        "item_name": entry.item_name,
        "amount": entry.amount,
        "note": entry.note,
        "timestamp": entry.timestamp.isoformat(),
    }
    try:
        _collection().insert_one(doc)
    except Exception as exc:
        logger.error("Failed to insert finance entry into Astra DB: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Gagal menyimpan catatan keuangan ke database: {exc}",
        ) from exc

    return _to_response(doc)


@router.get("/finance", response_model=list[FinanceEntryResponse])
async def list_finance_entries(limit: int = Query(default=200, ge=1, le=1000)):
    """Return finance entries (income + expense) sorted by newest first."""
    try:
        cursor = _collection().find({}, sort={"timestamp": -1}, limit=limit)
        docs = list(cursor)
    except Exception as exc:
        logger.error("Failed to fetch finance entries from Astra DB: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=f"Gagal mengambil catatan keuangan dari database: {exc}",
        ) from exc

    return [_to_response(doc) for doc in docs]
