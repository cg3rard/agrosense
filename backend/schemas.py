from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    image_url: HttpUrl
    text: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    diagnosis: str
    recommended_action: str
    cost_estimate: float
    roi_status: str


class TransactionRequest(BaseModel):
    item_name: str = Field(..., min_length=1)
    cost: float = Field(..., gt=0)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class TransactionResponse(BaseModel):
    id: str
    item_name: str
    cost: float
    timestamp: datetime
