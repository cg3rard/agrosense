from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyze import router as analyze_router
from routes.transaction import router as transaction_router

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AgroSense API",
    version="1.0.0",
    description="AI-powered crop diagnosis and operational expense tracking.",
)

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

app.include_router(analyze_router)
app.include_router(transaction_router)
