from pydantic import BaseModel, HttpUrl, Field
from typing import Literal, Optional
from datetime import datetime


class AnalyzeRequest(BaseModel):
    image_url: Optional[HttpUrl] = None
    text: str = Field(..., min_length=1)


RoiStatusType = Literal["Positive", "Neutral", "Negative"]


class RoiBreakdown(BaseModel):
    """
    Rincian perhitungan ROI yang dapat diaudit.

    Rumus: R = A×Y×P; Lw = R×L; Lt = Lw×(1−E); B = Lw−Lt;
           N = B−C; ROI% = N/C×100; BCR = B/C
    """

    status: RoiStatusType = Field(..., description="Klasifikasi hasil perhitungan ROI")
    roi_percent: float = Field(..., description="(manfaat bersih / biaya) × 100")
    benefit_cost_ratio: float = Field(..., description="manfaat / biaya (BCR)")

    # Komponen rumus (semua dalam Rupiah)
    revenue_potential: float = Field(..., description="R = luas × produktivitas × harga")
    loss_if_untreated: float = Field(..., description="Lw = R × fraksi kehilangan hasil")
    loss_if_treated: float = Field(..., description="Lt = Lw × (1 − efektivitas)")
    benefit: float = Field(..., description="B = Lw − Lt, nilai hasil yang terselamatkan")
    treatment_cost: float = Field(..., description="C = biaya tindakan")
    net_benefit: float = Field(..., description="N = B − C")
    break_even_cost: float = Field(..., description="Biaya maksimum agar tindakan tetap layak")
    break_even_loss_percent: float = Field(
        ..., description="Kehilangan hasil minimum (%) yang membenarkan biaya tersebut"
    )

    # Input yang dipakai (echo, untuk transparansi)
    land_area_ha: float
    yield_per_ha_kg: float
    price_per_kg: float
    yield_loss_percent: float
    effectiveness_percent: float

    assumed_fields: list[str] = Field(
        default_factory=list,
        description="Nama parameter yang memakai asumsi default karena tidak diisi",
    )
    formula: str = Field(default="", description="Ringkasan rumus yang dipakai")


class AnalyzeResponse(BaseModel):
    diagnosis: str
    recommended_action: str
    cost_estimate: float
    roi_status: RoiStatusType = Field(
        ..., description="Ringkasan status ROI — dihitung dari roi.status, bukan dari LLM"
    )
    roi: RoiBreakdown = Field(..., description="Rincian perhitungan ROI")


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
