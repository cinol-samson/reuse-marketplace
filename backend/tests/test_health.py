"""
Acceptance tests for Stage 0 – Health check.

Feature: Health check
  Scenario: GET /api/v1/healthz returns OK
    Given the API is running
    When I send GET /api/v1/healthz
    Then I receive 200 with status "ok"
"""

from __future__ import annotations


def test_healthz_returns_ok(client):
    """Given the API is running, when I GET /healthz, then status is ok."""
    response = client.get("/api/v1/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_healthz_response_shape(client):
    """Health response includes exactly the expected fields."""
    response = client.get("/api/v1/healthz")
    data = response.json()
    assert set(data.keys()) == {"status", "version"}


def test_categories_seeded(db):
    """After startup, the 11 spec-defined categories are in the database."""
    from app.models import Category
    from app.seed import CATEGORY_NAMES

    categories = db.query(Category).all()
    seeded_names = {c.name for c in categories}
    for name in CATEGORY_NAMES:
        assert name in seeded_names, f"Category '{name}' not seeded"
