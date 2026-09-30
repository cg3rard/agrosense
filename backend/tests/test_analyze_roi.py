"""
Test integrasi tipis untuk routes/analyze.py:
memastikan status ROI yang dikirim ke klien berasal dari rumus, bukan dari LLM.
"""

import json

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import routes.analyze as analyze_module
from routes.analyze import FarmParams, _to_float, build_analyze_response, router


app = FastAPI()
app.include_router(router)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("150000", 150_000.0),
        ("Rp 150.000", 150_000.0),
        ("150,000", 150_000.0),
        ("Rp1.250.000,50", 1_250_000.5),
        ("30%", 30.0),
        ("1.5", 1.5),
        ("1,5", 1.5),
        (250_000, 250_000.0),
        ("sekitar 75 ribu", 75.0),
        ("tidak diketahui", None),
        (None, None),
    ],
)
def test_parser_angka_gaya_indonesia(raw, expected):
    assert _to_float(raw) == expected


def test_status_llm_ditimpa_hasil_rumus():
    """LLM mengaku 'Positive' padahal biaya jauh melebihi manfaat."""
    parsed = {
        "diagnosis": "Bercak daun",
        "recommended_action": "Semprot fungisida",
        "cost_estimate": "Rp 20.000.000",
        "roi_status": "Positive",
        "expected_yield_loss_percent": "10",
        "treatment_effectiveness_percent": "50",
    }

    res = build_analyze_response(parsed, FarmParams(land_area_ha=0.5, yield_per_ha_kg=5000, price_per_kg=5000))


    assert res.roi.revenue_potential == 12_500_000
    assert res.roi.benefit == 625_000
    assert res.roi.net_benefit == -19_375_000
    assert res.roi_status == "Negative"
    assert res.roi.status == "Negative"


def test_parameter_petani_menimpa_estimasi_llm():
    parsed = {
        "diagnosis": "Wereng",
        "recommended_action": "Insektisida",
        "cost_estimate": 200_000,
        "expected_yield_loss_percent": "5",
        "treatment_effectiveness_percent": "20",
    }

    res = build_analyze_response(
        parsed,
        FarmParams(
            land_area_ha=1,
            yield_per_ha_kg=5000,
            price_per_kg=5000,
            yield_loss_percent=40,
            effectiveness_percent=50,
        ),
    )

    assert res.roi.yield_loss_percent == 40.0
    assert res.roi.effectiveness_percent == 50.0
    assert res.roi.benefit == 5_000_000
    assert res.roi_status == "Positive"


def test_field_hilang_memakai_default_dan_tetap_valid():
    res = build_analyze_response({})

    assert res.diagnosis == "Tidak diketahui"
    assert res.cost_estimate == 0.0
    assert res.roi_status in {"Positive", "Neutral", "Negative"}
    assert res.roi.formula





class _FakeResponse:
    def __init__(self, text: str):
        self.text = text
        self.status_code = 200

    def raise_for_status(self):
        return None


class _FakeAsyncClient:
    """Pengganti httpx.AsyncClient yang mengembalikan envelope Langflow palsu."""

    payload = {
        "diagnosis": "Blas daun",
        "recommended_action": "Aplikasi fungisida sistemik",
        "cost_estimate": "Rp 300.000",
        "roi_status": "Positive",
        "expected_yield_loss_percent": "25",
        "treatment_effectiveness_percent": "60",
    }

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def post(self, *args, **kwargs):
        envelope = {
            "outputs": [
                {
                    "outputs": [
                        {
                            "results": {
                                "message": {
                                    "data": {"text": json.dumps(self.payload)}
                                }
                            }
                        }
                    ]
                }
            ]
        }
        return _FakeResponse(json.dumps(envelope))


def test_endpoint_analyze_mengembalikan_rincian_roi(monkeypatch):
    monkeypatch.setattr(analyze_module.httpx, "AsyncClient", _FakeAsyncClient)

    client = TestClient(app)
    res = client.post(
        "/analyze",
        data={
            "text": "Daun padi berbercak dan mengering",
            "land_area_ha": "1",
            "yield_per_ha_kg": "5000",
            "price_per_kg": "6000",
        },
    )

    assert res.status_code == 200, res.text
    body = res.json()


    assert body["roi"]["revenue_potential"] == 30_000_000
    assert body["roi"]["loss_if_untreated"] == 7_500_000
    assert body["roi"]["benefit"] == 4_500_000
    assert body["roi"]["treatment_cost"] == 300_000
    assert body["roi"]["net_benefit"] == 4_200_000
    assert body["roi"]["roi_percent"] == 1400.0
    assert body["roi_status"] == "Positive"
    assert body["roi"]["assumed_fields"] == []
