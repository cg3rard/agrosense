import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from astrapy import DataAPIClient

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ASTRA_DB_APPLICATION_TOKEN = os.environ["ASTRA_DB_APPLICATION_TOKEN"]
ASTRA_DB_API_ENDPOINT = os.environ["ASTRA_DB_API_ENDPOINT"]
ASTRA_DB_KEYSPACE = os.getenv("ASTRA_DB_KEYSPACE", "agrosense")
ASTRA_DB_COLLECTION = os.getenv("ASTRA_DB_COLLECTION", "transactions")

# ---------------------------------------------------------------------------
# Astra DB
# ---------------------------------------------------------------------------

def get_collection():
    client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
    db = client.get_database_by_api_endpoint(ASTRA_DB_API_ENDPOINT)
    return db.get_collection(ASTRA_DB_COLLECTION, keyspace=ASTRA_DB_KEYSPACE)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class TransactionIn(BaseModel):
    item_name: str
    cost: int
    timestamp: str

class TransactionOut(BaseModel):
    id: str
    item_name: str
    cost: int
    timestamp: str

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="AgroSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.post("/transaction", response_model=TransactionOut, status_code=201)
def create_transaction(body: TransactionIn):
    doc = {
        "_id": str(uuid.uuid4()),
        "item_name": body.item_name,
        "cost": body.cost,
        "timestamp": body.timestamp,
    }
    try:
        get_collection().insert_one(doc)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {exc}")
    return TransactionOut(
        id=doc["_id"],
        item_name=doc["item_name"],
        cost=doc["cost"],
        timestamp=doc["timestamp"],
    )


@app.get("/transactions", response_model=list[TransactionOut])
def list_transactions():
    try:
        cursor = get_collection().find({})
        return [
            TransactionOut(
                id=str(doc.get("_id", "")),
                item_name=doc["item_name"],
                cost=doc["cost"],
                timestamp=doc["timestamp"],
            )
            for doc in cursor
        ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB fetch failed: {exc}")
