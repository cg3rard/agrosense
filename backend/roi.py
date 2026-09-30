"""
Perhitungan ROI (Return on Investment) tindakan agronomis — deterministik.

Sebelumnya `roi_status` murni berupa label yang dihasilkan LLM, sehingga tidak
bisa diaudit dan tidak konsisten. Modul ini menggantikannya dengan rumus
eksplisit: LLM hanya menyuplai *angka mentah* (estimasi biaya, perkiraan
kehilangan hasil, efektivitas tindakan), sedangkan keputusan untung/rugi
dihitung di sini.

RUMUS
-----
Notasi:
    A   = luas lahan (ha)
    Y   = produktivitas (kg/ha)
    P   = harga jual (Rp/kg)
    L   = fraksi kehilangan hasil bila tidak ditangani   (0..1)
    E   = efektivitas tindakan menyelamatkan hasil       (0..1)
    C   = biaya tindakan (Rp)

    (1) Potensi pendapatan          R  = A × Y × P
    (2) Kerugian bila dibiarkan     Lw = R × L
    (3) Kerugian setelah ditangani  Lt = Lw × (1 − E)
    (4) Manfaat / hasil terselamatkan
                                    B  = Lw − Lt = R × L × E
    (5) Manfaat bersih              N  = B − C
    (6) ROI                         ROI% = (N / C) × 100
    (7) Benefit–Cost Ratio          BCR  = B / C
    (8) Biaya maksimum (break-even) C_max = B
    (9) Ambang kehilangan hasil minimum agar tindakan layak
                                    L_min = C / (R × E)

KLASIFIKASI
-----------
    ROI% >= +20        -> "Positive"   (layak, sudah termasuk margin aman 20%)
    0 < ROI% < +20     -> "Neutral"    (marginal, selisihnya terlalu tipis)
    ROI% <= 0          -> "Negative"   (biaya >= manfaat)

Margin 20% dipakai karena seluruh input bersifat estimasi; ROI tipis tidak
cukup kuat untuk direkomendasikan sebagai "menguntungkan".
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional



DEFAULT_LAND_AREA_HA = 0.5
DEFAULT_YIELD_PER_HA_KG = 5200.0
DEFAULT_PRICE_PER_KG = 6500.0
DEFAULT_YIELD_LOSS_RATIO = 0.30
DEFAULT_EFFECTIVENESS_RATIO = 0.70


POSITIVE_ROI_THRESHOLD = 20.0
NEGATIVE_ROI_THRESHOLD = 0.0








MIN_VALID_TREATMENT_COST = 10_000.0

RoiStatus = str


def _clamp_ratio(value: float) -> float:
    """Batasi rasio ke rentang 0..1. Nilai >1 dianggap persen (mis. 30 -> 0.3)."""
    if value > 1.0:
        value = value / 100.0
    return max(0.0, min(1.0, value))


def _money(value: float) -> float:
    """Bulatkan nilai rupiah ke satuan terdekat."""
    return float(round(value))


def _pct(value: float) -> float:
    """Bulatkan persentase ke satu angka desimal."""
    return float(round(value, 1))


@dataclass
class RoiInputs:
    """Input mentah perhitungan ROI. Nilai None akan diganti asumsi default."""

    treatment_cost: float
    land_area_ha: Optional[float] = None
    yield_per_ha_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    yield_loss_ratio: Optional[float] = None
    effectiveness_ratio: Optional[float] = None


@dataclass
class RoiResult:
    """Hasil perhitungan + jejak audit setiap variabel dan asumsi."""

    status: RoiStatus
    roi_percent: float
    benefit_cost_ratio: float
    revenue_potential: float
    loss_if_untreated: float
    loss_if_treated: float
    benefit: float
    treatment_cost: float
    net_benefit: float
    break_even_cost: float
    break_even_loss_percent: float
    land_area_ha: float
    yield_per_ha_kg: float
    price_per_kg: float
    yield_loss_percent: float
    effectiveness_percent: float
    assumed_fields: list[str] = field(default_factory=list)
    formula: str = ""

    def as_dict(self) -> dict:
        return {
            "status": self.status,
            "roi_percent": self.roi_percent,
            "benefit_cost_ratio": self.benefit_cost_ratio,
            "revenue_potential": self.revenue_potential,
            "loss_if_untreated": self.loss_if_untreated,
            "loss_if_treated": self.loss_if_treated,
            "benefit": self.benefit,
            "treatment_cost": self.treatment_cost,
            "net_benefit": self.net_benefit,
            "break_even_cost": self.break_even_cost,
            "break_even_loss_percent": self.break_even_loss_percent,
            "land_area_ha": self.land_area_ha,
            "yield_per_ha_kg": self.yield_per_ha_kg,
            "price_per_kg": self.price_per_kg,
            "yield_loss_percent": self.yield_loss_percent,
            "effectiveness_percent": self.effectiveness_percent,
            "assumed_fields": self.assumed_fields,
            "formula": self.formula,
        }


def classify_roi(roi_percent: float, benefit: float, treatment_cost: float) -> RoiStatus:
    """
    Terjemahkan ROI numerik menjadi label status.

    Kasus khusus: biaya <= 0 berarti ROI tidak terdefinisi (pembagian nol).
    Tindakan tanpa biaya dianggap menguntungkan bila ada manfaat, netral bila
    tidak ada manfaat sama sekali.
    """
    if treatment_cost <= 0:
        return "Positive" if benefit > 0 else "Neutral"
    if roi_percent >= POSITIVE_ROI_THRESHOLD:
        return "Positive"
    if roi_percent <= NEGATIVE_ROI_THRESHOLD:
        return "Negative"
    return "Neutral"


def compute_roi(inputs: RoiInputs) -> RoiResult:
    """
    Hitung ROI tindakan agronomis dari parameter kebun + estimasi dampak.

    Setiap parameter yang tidak disediakan diganti asumsi default dan dicatat
    di `assumed_fields`, sehingga UI dapat memberi tahu petani angka mana yang
    masih berupa asumsi.
    """
    assumed: list[str] = []

    def resolve(value: Optional[float], default: float, name: str, *, ratio: bool = False) -> float:
        if value is None or value <= 0:
            assumed.append(name)
            return default
        return _clamp_ratio(value) if ratio else float(value)

    area = resolve(inputs.land_area_ha, DEFAULT_LAND_AREA_HA, "land_area_ha")
    yield_kg = resolve(inputs.yield_per_ha_kg, DEFAULT_YIELD_PER_HA_KG, "yield_per_ha_kg")
    price = resolve(inputs.price_per_kg, DEFAULT_PRICE_PER_KG, "price_per_kg")
    loss_ratio = resolve(
        inputs.yield_loss_ratio, DEFAULT_YIELD_LOSS_RATIO, "yield_loss_ratio", ratio=True
    )
    eff_ratio = resolve(
        inputs.effectiveness_ratio,
        DEFAULT_EFFECTIVENESS_RATIO,
        "effectiveness_ratio",
        ratio=True,
    )

    cost_raw = float(inputs.treatment_cost or 0.0)
    if 0.0 < cost_raw < MIN_VALID_TREATMENT_COST:



        assumed.append("treatment_cost")
        cost = 0.0
    else:
        cost = max(0.0, cost_raw)


    revenue_potential = area * yield_kg * price
    loss_if_untreated = revenue_potential * loss_ratio
    loss_if_treated = loss_if_untreated * (1.0 - eff_ratio)
    benefit = loss_if_untreated - loss_if_treated
    net_benefit = benefit - cost


    roi_percent = (net_benefit / cost * 100.0) if cost > 0 else 0.0
    bcr = (benefit / cost) if cost > 0 else 0.0


    break_even_cost = benefit

    denominator = revenue_potential * eff_ratio
    break_even_loss_percent = (cost / denominator * 100.0) if denominator > 0 else 0.0

    status = classify_roi(roi_percent, benefit, cost)

    formula = (
        "R = A×Y×P; Lw = R×L; Lt = Lw×(1−E); B = Lw−Lt; "
        "N = B−C; ROI% = N/C×100; BCR = B/C"
    )

    return RoiResult(
        status=status,
        roi_percent=_pct(roi_percent),
        benefit_cost_ratio=float(round(bcr, 2)),
        revenue_potential=_money(revenue_potential),
        loss_if_untreated=_money(loss_if_untreated),
        loss_if_treated=_money(loss_if_treated),
        benefit=_money(benefit),
        treatment_cost=_money(cost),
        net_benefit=_money(net_benefit),
        break_even_cost=_money(break_even_cost),
        break_even_loss_percent=_pct(min(break_even_loss_percent, 100.0)),
        land_area_ha=float(round(area, 4)),
        yield_per_ha_kg=_money(yield_kg),
        price_per_kg=_money(price),
        yield_loss_percent=_pct(loss_ratio * 100.0),
        effectiveness_percent=_pct(eff_ratio * 100.0),
        assumed_fields=assumed,
        formula=formula,
    )
