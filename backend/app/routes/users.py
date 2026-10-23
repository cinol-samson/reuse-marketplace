"""User routes: GET/PATCH /users/me, GET /users/{id}."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models import Request as RequestModel, RequestStatus, User, UserStatus
from app.schemas import PatchMeRequest, UserMeResponse, UserPublicResponse

router = APIRouter(prefix="/users", tags=["users"])


def _completed_exchanges_count(user: User, db: Session) -> int:
    """Count requests where this user is owner or requester, status=completed, counts_toward_total=True."""
    from app.models import Item

    # As requester
    as_requester = (
        db.query(RequestModel)
        .filter(
            RequestModel.requester_id == user.id,
            RequestModel.status == RequestStatus.completed,
            RequestModel.counts_toward_total.is_(True),
        )
        .count()
    )
    # As owner (join via item)
    as_owner = (
        db.query(RequestModel)
        .join(Item, RequestModel.item_id == Item.id)
        .filter(
            Item.owner_id == user.id,
            RequestModel.status == RequestStatus.completed,
            RequestModel.counts_toward_total.is_(True),
        )
        .count()
    )
    return as_requester + as_owner


@router.get("/me", response_model=UserMeResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserMeResponse:
    """Return the authenticated user's full profile."""
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        is_artist=current_user.is_artist,
        is_rag_picker=current_user.is_rag_picker,
        is_admin=current_user.is_admin,
        is_discoverable=current_user.is_discoverable,
        home_area_label=current_user.home_area_label,
        status=current_user.status.value,
        created_at=current_user.created_at,
    )


@router.patch("/me", response_model=UserMeResponse)
def patch_me(
    body: PatchMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserMeResponse:
    """Update the authenticated user's profile fields."""
    settings = get_settings()

    if body.display_name is not None:
        current_user.display_name = body.display_name
    if body.is_artist is not None:
        current_user.is_artist = body.is_artist
    if body.is_rag_picker is not None:
        current_user.is_rag_picker = body.is_rag_picker
    if body.is_discoverable is not None:
        current_user.is_discoverable = body.is_discoverable
    if body.home_area_label is not None:
        current_user.home_area_label = body.home_area_label
    if body.home_lat is not None:
        current_user.home_lat = round(body.home_lat, settings.COORD_DECIMALS)
    if body.home_lng is not None:
        current_user.home_lng = round(body.home_lng, settings.COORD_DECIMALS)

    db.commit()
    db.refresh(current_user)

    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        is_artist=current_user.is_artist,
        is_rag_picker=current_user.is_rag_picker,
        is_admin=current_user.is_admin,
        is_discoverable=current_user.is_discoverable,
        home_area_label=current_user.home_area_label,
        status=current_user.status.value,
        created_at=current_user.created_at,
    )


@router.get("/{user_id}", response_model=UserPublicResponse)
def get_user_public(
    user_id: int,
    db: Session = Depends(get_db),
) -> UserPublicResponse:
    """Public profile: display name, roles, completed-exchanges count, member since.

    EC1.5: never exposes email or exact location.
    """
    user: User | None = db.get(User, user_id)
    if user is None or user.status == UserStatus.deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "user_not_found", "message": "User not found."},
        )

    return UserPublicResponse(
        id=user.id,
        display_name=user.display_name,
        is_artist=user.is_artist,
        is_rag_picker=user.is_rag_picker,
        is_admin=user.is_admin,
        completed_exchanges=_completed_exchanges_count(user, db),
        member_since=user.created_at,
    )
