"""
Unit tests for the SPA-EWS Flask risk-prediction service.

Setup (run from inside the ml_service/ directory):
    pip install pytest flask flask-cors xgboost scikit-learn pandas groq python-dotenv

Run:
    cd ml_service
    pytest test_risk_api.py -v

Tests are written against the actual SPA-EWS app.py:
  - Routes:   GET /health   POST /predict
  - Features: 18 real input fields (OS_Attendance, OS_CIE, DBMS_Attendance, …)
  - Response: { riskLevel, riskScore, probabilities, insight, model }
"""

import pytest
from app import app  # Flask instance defined in ml_service/app.py

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# A complete, valid payload using all 18 model features.
# Values are plausible mid-range numbers so the model won't crash.
VALID_PAYLOAD = {
    "OS_Attendance": 78,
    "OS_CIE": 65,
    "DBMS_Attendance": 80,
    "DBMS_CIE": 70,
    "SE_Attendance": 75,
    "SE_CIE": 60,
    "MDM_Attendance": 82,
    "MDM_CIE": 72,
    "Entrepreneurship_Attendance": 70,
    "Entrepreneurship_CIE": 55,
    "ICSR_Attendance": 85,
    "ICSR_CIE": 68,
    "AMCAT_Logical": 60,
    "AMCAT_Quant": 55,
    "AMCAT_Verbal": 62,
    "AMCAT_Domain": 58,
    "Active_Backlogs": 0,
    "Portal_Logins_Per_Month": 12,
}

VALID_RISK_LEVELS = {"CRITICAL", "WARNING", "SAFE"}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    """Return a Flask test client with TESTING mode on and Groq disabled."""
    app.config["TESTING"] = True
    # Disable Groq during tests so we don't need a live API key
    import app as app_module
    original_client = app_module.client
    app_module.client = None          # suppress LLM calls
    with app.test_client() as c:
        yield c
    app_module.client = original_client   # restore after test


# ---------------------------------------------------------------------------
# 1. Health check
# ---------------------------------------------------------------------------

def test_health_returns_200(client):
    """GET /health should return HTTP 200."""
    resp = client.get("/health")
    assert resp.status_code == 200


def test_health_response_shape(client):
    """GET /health JSON must contain 'status' and 'model' keys."""
    resp = client.get("/health")
    data = resp.get_json()
    assert "status" in data
    assert "model" in data
    assert data["status"] == "ok"


# ---------------------------------------------------------------------------
# 2. Valid prediction — full payload
# ---------------------------------------------------------------------------

def test_predict_valid_full_payload(client):
    """POST /predict with all 18 features must return HTTP 200."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    assert resp.status_code == 200


def test_predict_response_has_required_keys(client):
    """POST /predict response must include riskLevel, riskScore, probabilities."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    data = resp.get_json()
    assert "riskLevel" in data, "Missing key: riskLevel"
    assert "riskScore" in data, "Missing key: riskScore"
    assert "probabilities" in data, "Missing key: probabilities"
    assert "model" in data, "Missing key: model"


def test_predict_risk_level_is_valid_label(client):
    """riskLevel must be one of CRITICAL / WARNING / SAFE."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    data = resp.get_json()
    assert data["riskLevel"] in VALID_RISK_LEVELS


def test_predict_risk_score_range(client):
    """riskScore must be a percentage between 0 and 100 (inclusive)."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    data = resp.get_json()
    score = data["riskScore"]
    assert isinstance(score, (int, float)), "riskScore must be numeric"
    assert 0 <= score <= 100, f"riskScore out of range: {score}"


def test_predict_probabilities_sum_near_100(client):
    """CRITICAL + WARNING + SAFE probabilities should sum to ~100%."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    probs = resp.get_json()["probabilities"]
    total = probs.get("CRITICAL", 0) + probs.get("WARNING", 0) + probs.get("SAFE", 0)
    assert abs(total - 100.0) < 1.0, f"Probabilities don't sum to ~100: {total}"


# ---------------------------------------------------------------------------
# 3. Missing fields — app defaults them to 0, so still 200
# ---------------------------------------------------------------------------

def test_predict_missing_fields_still_succeeds(client):
    """
    The app fills missing features with 0 (see app.py line 49).
    A partial payload must still return 200 — not 400.
    """
    partial = {"OS_Attendance": 90, "OS_CIE": 75}
    resp = client.post("/predict", json=partial)
    assert resp.status_code == 200


def test_predict_empty_body_still_succeeds(client):
    """An empty JSON body should succeed — all features default to 0."""
    resp = client.post("/predict", json={})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "riskLevel" in data


# ---------------------------------------------------------------------------
# 4. Edge / boundary values
# ---------------------------------------------------------------------------

def test_predict_all_zeros(client):
    """All-zero input (worst case) must not crash the model."""
    zeros = {k: 0 for k in VALID_PAYLOAD}
    resp = client.post("/predict", json=zeros)
    assert resp.status_code == 200
    assert resp.get_json()["riskLevel"] in VALID_RISK_LEVELS


def test_predict_perfect_student(client):
    """All-maximum input (best case) must return a valid prediction."""
    perfect = {
        "OS_Attendance": 100, "OS_CIE": 100,
        "DBMS_Attendance": 100, "DBMS_CIE": 100,
        "SE_Attendance": 100, "SE_CIE": 100,
        "MDM_Attendance": 100, "MDM_CIE": 100,
        "Entrepreneurship_Attendance": 100, "Entrepreneurship_CIE": 100,
        "ICSR_Attendance": 100, "ICSR_CIE": 100,
        "AMCAT_Logical": 100, "AMCAT_Quant": 100,
        "AMCAT_Verbal": 100, "AMCAT_Domain": 100,
        "Active_Backlogs": 0, "Portal_Logins_Per_Month": 30,
    }
    resp = client.post("/predict", json=perfect)
    assert resp.status_code == 200
    assert resp.get_json()["riskLevel"] in VALID_RISK_LEVELS


def test_predict_high_backlogs(client):
    """Many active backlogs with low attendance should not crash the model."""
    risky = {**VALID_PAYLOAD, "Active_Backlogs": 10, "OS_Attendance": 20, "OS_CIE": 15}
    resp = client.post("/predict", json=risky)
    assert resp.status_code == 200


def test_predict_extra_unknown_fields_ignored(client):
    """Unknown keys in the payload (e.g. 'name') must not break anything."""
    payload_with_extras = {**VALID_PAYLOAD, "name": "Test Student", "_courseDetails": []}
    resp = client.post("/predict", json=payload_with_extras)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 5. Groq/insight field
# ---------------------------------------------------------------------------

def test_predict_insight_is_string_or_none(client):
    """insight field must be a string (fallback message) when Groq is disabled."""
    resp = client.post("/predict", json=VALID_PAYLOAD)
    insight = resp.get_json().get("insight")
    # With Groq disabled in the fixture, insight will be a fallback string
    assert insight is None or isinstance(insight, str)
