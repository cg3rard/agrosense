from pydantic import BaseModel, HttpUrl, Field
from typing import Literal, Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    image_url: Optional[HttpUrl] = None
    text: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    diagnosis: str
    recommended_action: str
    cost_estimate: float
    roi_status: str


FinanceEntryType = Literal["expense", "income"]


class FinanceEntryRequest(BaseModel):
    type: FinanceEntryType
    item_name: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    note: Optional[str] = Field(default=None, max_length=500)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class FinanceEntryResponse(BaseModel):
    id: str
    type: FinanceEntryType
    item_name: str
    amount: float
    note: Optional[str] = None
    timestamp: datetime
