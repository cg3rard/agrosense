"""
Unit test rumus ROI.

Setiap kasus memakai angka yang mudah diverifikasi manual agar rumus di
roi.py bisa diaudit tanpa menjalankan seluruh aplikasi.
"""

import pytest

from roi import (
    DEFAULT_EFFECTIVENESS_RATIO,
    DEFAULT_LAND_AREA_HA,
    DEFAULT_PRICE_PER_KG,
    DEFAULT_YIELD_LOSS_RATIO,
    DEFAULT_YIELD_PER_HA_KG,
    RoiInputs,
    classify_roi,
    compute_roi,
)


def test_rumus_dasar_dengan_angka_bulat():
    """
    A=1 ha, Y=5000 kg/ha, P=Rp5.000/kg  -> R = 25.000.000
    L=40%                               -> Lw = 10.000.000
    E=50%                               -> Lt = 5.000.000, B = 5.000.000
    C=1.000.000                         -> N = 4.000.000, ROI = 400%, BCR = 5
    """
    r = compute_roi(
        RoiInputs(
            treatment_cost=1_000_000,
            land_area_ha=1.0,
            yield_per_ha_kg=5000,
            price_per_kg=5000,
            yield_loss_ratio=40,
            effectiveness_ratio=50,
        )
    )

    assert r.revenue_potential == 25_000_000
    assert r.loss_if_untreated == 10_000_000
    assert r.loss_if_treated == 5_000_000
    assert r.benefit == 5_000_000
    assert r.net_benefit == 4_000_000
    assert r.roi_percent == 400.0
    assert r.benefit_cost_ratio == 5.0
    assert r.status == "Positive"
    # Biaya maksimum agar masih break-even = manfaat
    assert r.break_even_cost == 5_000_000
    # L_min = C / (R × E) = 1.000.000 / 12.500.000 = 8%
    assert r.break_even_loss_percent == 8.0
    assert r.assumed_fields == []


def test_biaya_melebihi_manfaat_menghasilkan_negative():
    """B = 25.000.000 × 10% × 50% = 1.250.000; C = 2.000.000 -> ROI = -37,5%."""
    r = compute_roi(
        RoiInputs(
            treatment_cost=2_000_000,
            land_area_ha=1.0,
            yield_per_ha_kg=5000,
            price_per_kg=5000,
            yield_loss_ratio=10,
            effectiveness_ratio=50,
        )
    )

    assert r.benefit == 1_250_000
    assert r.net_benefit == -750_000
    assert r.roi_percent == -37.5
    assert r.status == "Negative"


def test_roi_tipis_dianggap_neutral():
    """ROI +10% berada di bawah ambang +20% -> Neutral, bukan Positive."""
    # B = 1.100.000 dari R=11.000.000 (1 ha × 2200 kg × Rp5.000), L=20%, E=50%
    r = compute_roi(
        RoiInputs(
            treatment_cost=1_000_000,
            land_area_ha=1.0,
            yield_per_ha_kg=2200,
            price_per_kg=5000,
            yield_loss_ratio=20,
            effectiveness_ratio=50,
        )
    )

    assert r.benefit == 1_100_000
    assert r.roi_percent == 10.0
    assert r.status == "Neutral"


def test_parameter_kosong_memakai_asumsi_default():
    r = compute_roi(RoiInputs(treatment_cost=150_000))

    expected_revenue = DEFAULT_LAND_AREA_HA * DEFAULT_YIELD_PER_HA_KG * DEFAULT_PRICE_PER_KG
    expected_benefit = expected_revenue * DEFAULT_YIELD_LOSS_RATIO * DEFAULT_EFFECTIVENESS_RATIO

    assert r.revenue_potential == round(expected_revenue)
    assert r.benefit == round(expected_benefit)
    assert set(r.assumed_fields) == {
        "land_area_ha",
        "yield_per_ha_kg",
        "price_per_kg",
        "yield_loss_ratio",
        "effectiveness_ratio",
    }


def test_rasio_diterima_dalam_bentuk_persen_maupun_desimal():
    persen = compute_roi(
        RoiInputs(treatment_cost=500_000, land_area_ha=1, yield_per_ha_kg=1000, price_per_kg=10_000, yield_loss_ratio=30, effectiveness_ratio=80)
    )
    desimal = compute_roi(
        RoiInputs(treatment_cost=500_000, land_area_ha=1, yield_per_ha_kg=1000, price_per_kg=10_000, yield_loss_ratio=0.3, effectiveness_ratio=0.8)
    )

    assert persen.as_dict() == desimal.as_dict()
    assert persen.yield_loss_percent == 30.0
    assert persen.effectiveness_percent == 80.0


def test_rasio_di_atas_seratus_persen_dipangkas():
    r = compute_roi(
        RoiInputs(
            treatment_cost=100_000,
            land_area_ha=1,
            yield_per_ha_kg=1000,
            price_per_kg=10_000,
            yield_loss_ratio=250,
            effectiveness_ratio=999,
        )
    )

    assert r.yield_loss_percent == 100.0
    assert r.effectiveness_percent == 100.0
    # Seluruh potensi pendapatan hilang dan seluruhnya terselamatkan
    assert r.benefit == r.revenue_potential
    assert r.loss_if_treated == 0


def test_biaya_nol_tidak_membagi_dengan_nol():
    r = compute_roi(RoiInputs(treatment_cost=0))

    assert r.roi_percent == 0.0
    assert r.benefit_cost_ratio == 0.0
    assert r.status == "Positive"  # ada manfaat, tanpa biaya


def test_biaya_recehan_tidak_menghasilkan_roi_ekstrem():
    """
    Bug nyata: LLM mengembalikan cost_estimate super kecil (mis. salah
    parsing satuan) -> ROI% = net_benefit / cost × 100 meledak ke jutaan
    persen. Biaya di bawah MIN_VALID_TREATMENT_COST harus diperlakukan
    sebagai "belum ada estimasi", sama seperti biaya nol.
    """
    r = compute_roi(RoiInputs(treatment_cost=1))

    assert r.treatment_cost == 0
    assert r.roi_percent == 0.0
    assert r.benefit_cost_ratio == 0.0
    assert "treatment_cost" in r.assumed_fields
    # ROI harus tetap masuk akal, jauh di bawah ambang bug (700.199.900%)
    assert r.roi_percent < 1000.0


def test_biaya_tepat_di_ambang_minimum_dipakai_apa_adanya():
    """Biaya == MIN_VALID_TREATMENT_COST (Rp 10.000) tidak dianggap recehan."""
    r = compute_roi(RoiInputs(treatment_cost=10_000))

    assert r.treatment_cost == 10_000
    assert "treatment_cost" not in r.assumed_fields


@pytest.mark.parametrize(
    ("roi_percent", "expected"),
    [(20.0, "Positive"), (19.9, "Neutral"), (0.1, "Neutral"), (0.0, "Negative"), (-5.0, "Negative")],
)
def test_ambang_klasifikasi(roi_percent, expected):
    assert classify_roi(roi_percent, benefit=1.0, treatment_cost=1.0) == expected
