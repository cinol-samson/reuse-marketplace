"""Auth routes: POST /auth/register and POST /auth/login."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.config import get_settings
from app.database import get_db
from app.models import User, UserStatus
from app.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

limiter = Limiter(key_func=get_remote_address)


def _email_exists(db: Session, email: str) -> bool:
    return db.query(User).filter(func.lower(User.email) == email.lower()).first() is not None


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("10/minute")
def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Register a new user account.

    EC1.1: duplicate email (case-insensitive) rejected.
    EC1.2: weak password rejected (validated in schema).
    EC1.3: rate-limited 10/min/IP.
    ADMIN_EMAIL: that email gets is_admin=True on registration.
    """
    settings = get_settings()
    normalized_email = body.email.lower()

    # EC1.1: duplicate email
    if _email_exists(db, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "email_taken",
                "message": "An account with this email address already exists.",
            },
        )

    is_admin = bool(
        settings.ADMIN_EMAIL and normalized_email == settings.ADMIN_EMAIL.lower()
    )

    user = User(
        email=normalized_email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        is_artist=body.is_artist,
        is_rag_picker=body.is_rag_picker,
        is_admin=is_admin,
        status=UserStatus.active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate and return a JWT.

    EC1.4: suspended/deleted users cannot log in.
    EC1.3: rate-limited 10/min/IP.
    """
    normalized_email = body.email.lower()
    user: User | None = (
        db.query(User).filter(func.lower(User.email) == normalized_email).first()
    )

    # Use the same error message for bad email or bad password to prevent enumeration.
    _creds_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "code": "invalid_credentials",
            "message": "Incorrect email or password.",
        },
    )

    if user is None or not verify_password(body.password, user.password_hash):
        raise _creds_error

    # EC1.4: suspended or deleted accounts cannot log in
    if user.status != UserStatus.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "account_suspended",
                "message": "Your account has been suspended or deleted.",
            },
        )

    return TokenResponse(access_token=create_access_token(user.id))
