import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException
from schemas import TransactionRequest, TransactionResponse
from db import get_collection

router = APIRouter()


def build_document(request: TransactionRequest) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "item_name": request.item_name,
        "cost": request.cost,
        "timestamp": request.timestamp.isoformat(),
    }


@router.post("/transaction", response_model=TransactionResponse)
async def create_transaction(request: TransactionRequest):
    doc = build_document(request)
    try:
        collection = get_collection()
        collection.insert_one(doc)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {exc}")

    return TransactionResponse(
        id=doc["_id"],
        item_name=doc["item_name"],
        cost=doc["cost"],
        timestamp=request.timestamp,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions():
    """Return all stored transactions, most recent first (by timestamp)."""
    try:
        collection = get_collection()
        cursor = collection.find({})
        docs = list(cursor)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB query failed: {exc}")

    results: List[TransactionResponse] = []
    for doc in docs:
        try:
            results.append(
                TransactionResponse(
                    id=str(doc.get("_id", "")),
                    item_name=doc["item_name"],
                    cost=float(doc["cost"]),
                    timestamp=datetime.fromisoformat(doc["timestamp"]),
                )
            )
        except (KeyError, ValueError):
            # Skip malformed documents
            continue

    # Sort most recent first
    results.sort(key=lambda r: r.timestamp, reverse=True)
    return results
