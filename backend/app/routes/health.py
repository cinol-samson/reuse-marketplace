from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str


@router.get("/healthz", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    """Returns OK if the service is running."""
    return HealthResponse(status="ok", version="0.1.0")
