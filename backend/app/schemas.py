"""Pydantic v2 request and response schemas for the Reuse Marketplace API."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=1, max_length=100)
    is_artist: bool = False
    is_rag_picker: bool = False

    @field_validator("password")
    @classmethod
    def password_not_trivial(cls, v: str) -> str:
        """EC1.2: require at least one digit or special char in addition to length."""
        has_letter = any(c.isalpha() for c in v)
        has_non_alpha = any(not c.isalpha() for c in v)
        if not (has_letter and has_non_alpha):
            raise ValueError(
                "Password must contain at least one letter and one digit or special character."
            )
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User schemas ────────────────────────────────────────────────────────────

class UserPublicResponse(BaseModel):
    """Public view of a user profile – never exposes email or exact location."""
    id: int
    display_name: str
    is_artist: bool
    is_rag_picker: bool
    is_admin: bool
    completed_exchanges: int
    member_since: datetime

    model_config = {"from_attributes": True}


class UserMeResponse(BaseModel):
    """Full authenticated user view."""
    id: int
    email: str
    display_name: str
    is_artist: bool
    is_rag_picker: bool
    is_admin: bool
    is_discoverable: bool
    home_area_label: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PatchMeRequest(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    is_artist: bool | None = None
    is_rag_picker: bool | None = None
    is_discoverable: bool | None = None
    home_area_label: str | None = Field(default=None, max_length=200)
    # Rounded lat/lng for rag pickers / artists; stored rounded server-side
    home_lat: float | None = None
    home_lng: float | None = None
