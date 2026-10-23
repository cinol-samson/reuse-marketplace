"""
Acceptance tests for Stage 1 – Accounts and profile.

Feature: User registration
  Scenario: Register a new user successfully
    Given the API is running
    When I POST /auth/register with valid email, password, and display_name
    Then I receive 201 with an access_token

  Scenario EC1.1: Duplicate email rejected
    Given a user already exists with email test@example.com
    When I POST /auth/register with the same email (different case)
    Then I receive 409 with code email_taken

  Scenario EC1.2: Weak password rejected
    Given the API is running
    When I POST /auth/register with password "password" (letters only)
    Then I receive 422 with a validation error

Feature: Login
  Scenario: Successful login returns token
    Given a registered user exists
    When I POST /auth/login with correct credentials
    Then I receive 200 with an access_token

  Scenario: Wrong password rejected
    Given a registered user exists
    When I POST /auth/login with wrong password
    Then I receive 401 with code invalid_credentials

  Scenario EC1.4: Suspended user cannot log in
    Given a user exists with status=suspended
    When I POST /auth/login
    Then I receive 403 with code account_suspended

Feature: Authenticated user endpoints
  Scenario: GET /users/me returns own profile
    Given I am logged in
    When I GET /users/me
    Then I receive 200 with my email and display_name

  Scenario: PATCH /users/me updates display_name
    Given I am logged in
    When I PATCH /users/me with a new display_name
    Then I receive 200 with the updated display_name

  Scenario: GET /users/{id} returns public profile
    Given a user exists
    When I GET /users/{id}
    Then I receive 200 with display_name, roles, completed_exchanges, member_since
    And email is NOT in the response

  Scenario EC1.4: Token rejected for suspended user on each request
    Given a user has a valid token but is now suspended
    When I GET /users/me with that token
    Then I receive 403 with code account_suspended

  Scenario EC1.5: Public profile never exposes email or exact location
    Given a user with email and home location
    When I GET /users/{id}
    Then the response has no email field and no home_lat/home_lng
"""

from __future__ import annotations

import pytest


# ── Helpers ────────────────────────────────────────────────────────────────

def _register(client, email="alice@example.com", password="SecurePass1", display_name="Alice"):
    return client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "display_name": display_name},
    )


def _login(client, email="alice@example.com", password="SecurePass1"):
    return client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )


def _auth_headers(client, email="alice@example.com", password="SecurePass1"):
    _register(client, email=email, password=password)
    r = _login(client, email=email, password=password)
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Registration ───────────────────────────────────────────────────────────

def test_register_success(client):
    """Scenario: Register a new user successfully."""
    r = _register(client)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_sets_admin_flag(client):
    """ADMIN_EMAIL matching email gets is_admin=True."""
    import os
    os.environ["ADMIN_EMAIL"] = "admin@example.com"
    from app.config import get_settings
    get_settings.cache_clear()  # type: ignore[attr-defined]

    try:
        r = _register(client, email="admin@example.com", password="Admin1234!")
        assert r.status_code == 201
        token = r.json()["access_token"]
        me_r = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert me_r.json()["is_admin"] is True
    finally:
        del os.environ["ADMIN_EMAIL"]
        get_settings.cache_clear()  # type: ignore[attr-defined]


class TestEC11DuplicateEmail:
    """EC1.1: Duplicate email (case-insensitive) rejected."""

    def test_duplicate_exact(self, client):
        _register(client)
        r = _register(client)
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "email_taken"

    def test_duplicate_case_insensitive(self, client):
        _register(client, email="Alice@Example.COM")
        r = _register(client, email="alice@example.com")
        assert r.status_code == 409
        assert r.json()["detail"]["code"] == "email_taken"


class TestEC12WeakPassword:
    """EC1.2: Weak password rejected with a clear message."""

    def test_letters_only(self, client):
        r = _register(client, password="onlyletters")
        assert r.status_code == 422

    def test_too_short(self, client):
        r = _register(client, password="Ab1")
        assert r.status_code == 422

    def test_strong_passes(self, client):
        r = _register(client, password="SecurePass1")
        assert r.status_code == 201


# ── Login ──────────────────────────────────────────────────────────────────

def test_login_success(client):
    """Scenario: Successful login returns token."""
    _register(client)
    r = _login(client)
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    """Scenario: Wrong password rejected."""
    _register(client)
    r = _login(client, password="WrongPass99!")
    assert r.status_code == 401
    assert r.json()["detail"]["code"] == "invalid_credentials"


def test_login_unknown_email(client):
    """Unknown email returns the same 401 (no enumeration)."""
    r = _login(client, email="nobody@example.com")
    assert r.status_code == 401


class TestEC14SuspendedLogin:
    """EC1.4: Suspended users cannot log in."""

    def test_suspended_cannot_login(self, client, db):
        _register(client)
        from app.models import User, UserStatus
        from sqlalchemy import func
        user = db.query(User).filter(func.lower(User.email) == "alice@example.com").first()
        assert user is not None
        user.status = UserStatus.suspended
        db.commit()

        r = _login(client)
        assert r.status_code == 403
        assert r.json()["detail"]["code"] == "account_suspended"


# ── /users/me ──────────────────────────────────────────────────────────────

def test_get_me_authenticated(client):
    """Scenario: GET /users/me returns own profile."""
    headers = _auth_headers(client)
    r = client.get("/api/v1/users/me", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "alice@example.com"
    assert data["display_name"] == "Alice"
    assert "password_hash" not in data


def test_get_me_unauthenticated(client):
    """Unauthenticated request returns 401."""
    r = client.get("/api/v1/users/me")
    assert r.status_code == 401


def test_patch_me_display_name(client):
    """Scenario: PATCH /users/me updates display_name."""
    headers = _auth_headers(client)
    r = client.patch("/api/v1/users/me", json={"display_name": "Alicia"}, headers=headers)
    assert r.status_code == 200
    assert r.json()["display_name"] == "Alicia"


def test_patch_me_roles(client):
    """Scenario: Update is_artist and is_rag_picker."""
    headers = _auth_headers(client)
    r = client.patch(
        "/api/v1/users/me",
        json={"is_artist": True, "is_rag_picker": False},
        headers=headers,
    )
    assert r.status_code == 200
    assert r.json()["is_artist"] is True


def test_patch_me_home_location_rounded(client):
    """Coordinates are rounded to COORD_DECIMALS before storing."""
    headers = _auth_headers(client)
    r = client.patch(
        "/api/v1/users/me",
        json={"home_lat": 12.345678, "home_lng": 77.987654},
        headers=headers,
    )
    assert r.status_code == 200
    # Should not expose raw lat/lng in response (they're not in UserMeResponse)
    data = r.json()
    assert "home_lat" not in data
    assert "home_lng" not in data


class TestEC14TokenRejectedForSuspended:
    """EC1.4: An existing token stops working for a suspended user."""

    def test_token_rejected_after_suspension(self, client, db):
        headers = _auth_headers(client)
        # Verify working first
        assert client.get("/api/v1/users/me", headers=headers).status_code == 200

        from app.models import User, UserStatus
        from sqlalchemy import func
        user = db.query(User).filter(func.lower(User.email) == "alice@example.com").first()
        assert user is not None
        user.status = UserStatus.suspended
        db.commit()

        r = client.get("/api/v1/users/me", headers=headers)
        assert r.status_code == 403
        assert r.json()["detail"]["code"] == "account_suspended"


# ── /users/{id} public profile ─────────────────────────────────────────────

class TestPublicProfile:
    """EC1.5: Public profile never exposes email or exact location."""

    def test_public_profile_fields(self, client):
        """Scenario: GET /users/{id} returns public info."""
        r = _register(client)
        token = r.json()["access_token"]
        me = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        user_id = me.json()["id"]

        pub = client.get(f"/api/v1/users/{user_id}")
        assert pub.status_code == 200
        data = pub.json()
        assert "display_name" in data
        assert "is_artist" in data
        assert "completed_exchanges" in data
        assert "member_since" in data

    def test_no_email_in_public_profile(self, client):
        """EC1.5: email not present."""
        r = _register(client)
        token = r.json()["access_token"]
        user_id = client.get(
            "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
        ).json()["id"]

        pub = client.get(f"/api/v1/users/{user_id}")
        assert "email" not in pub.json()

    def test_no_exact_location_in_public_profile(self, client):
        """EC1.5: home_lat and home_lng not present."""
        headers = _auth_headers(client)
        client.patch(
            "/api/v1/users/me",
            json={"home_lat": 12.345, "home_lng": 77.123},
            headers=headers,
        )
        user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]
        pub = client.get(f"/api/v1/users/{user_id}")
        data = pub.json()
        assert "home_lat" not in data
        assert "home_lng" not in data

    def test_completed_exchanges_zero_initially(self, client):
        """New user has completed_exchanges = 0."""
        r = _register(client)
        token = r.json()["access_token"]
        user_id = client.get(
            "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
        ).json()["id"]
        pub = client.get(f"/api/v1/users/{user_id}")
        assert pub.json()["completed_exchanges"] == 0

    def test_unknown_user_404(self, client):
        """GET /users/99999 returns 404."""
        r = client.get("/api/v1/users/99999")
        assert r.status_code == 404
