"""Item routes for listings and Cloudinary uploads."""
from __future__ import annotations

import math
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_settings
from app.database import get_db
from app.models import (
    Category,
    DeliveryOption,
    HiddenReason,
    Item,
    ItemStatus,
    ListingType,
    User,
    UserStatus,
)
from app.schemas import ItemCreateRequest, ItemPatchRequest, ItemResponse, ItemStatusUpdate

router = APIRouter(prefix="/items", tags=["items"])


def _with_ttl() -> datetime:
    settings = get_settings()
    return datetime.now(UTC) + timedelta(days=settings.LISTING_TTL_DAYS)


def _normalize_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _is_cloudinary_url(url: str) -> bool:
    return "cloudinary.com" in url and "/image/upload/" in url


def _validate_listing_payload(payload: ItemCreateRequest | ItemPatchRequest) -> None:
    if isinstance(payload, ItemCreateRequest):
        photos = payload.photos
    else:
        photos = payload.photos
    if photos is not None and len(photos) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_photos", "message": "At least one photo is required."},
        )
    if photos is not None and len(photos) > 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_photos", "message": "A listing can have at most 5 photos."},
        )
    if photos is not None:
        for photo in photos:
            if not _is_cloudinary_url(photo):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "code": "invalid_photo_url",
                        "message": "Each photo must use a Cloudinary URL.",
                    },
                )
    if getattr(payload, "listing_type", None) == ListingType.donation:
        delivery_option = getattr(payload, "delivery_option", None)
        if delivery_option is not None and delivery_option != DeliveryOption.pickup:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "donation_requires_pickup",
                    "message": "Donations must use pickup delivery.",
                },
            )
    if getattr(payload, "listing_type", None) == ListingType.sale:
        price = getattr(payload, "price", None)
        if price is None or price <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "invalid_price",
                    "message": "Price is required and must be positive for sale listings.",
                },
            )
    if getattr(payload, "prohibited_items_confirmed", False) is False:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "prohibited_items_not_confirmed",
                "message": "Please confirm the prohibited items checklist before posting.",
            },
        )

    settings = get_settings()
    text = " ".join(
        [
            getattr(payload, "title", ""),
            getattr(payload, "description", ""),
        ]
    )
    lower_text = text.lower()
    matches = [
        keyword.strip().lower()
        for keyword in settings.prohibited_keywords_list
        if keyword and any(word == keyword for word in lower_text.split())
    ]
    if matches:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "prohibited_keyword_detected",
                "message": f"Listing contains a prohibited keyword: {', '.join(matches)}.",
            },
        )

    lat = getattr(payload, "lat", None)
    lng = getattr(payload, "lng", None)
    bbox = settings.launch_bbox_tuple
    if lat is not None and lng is not None and bbox is not None:
        min_lat, min_lng, max_lat, max_lng = bbox
        if not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "outside_launch_bbox",
                    "message": "The item location must be within the launch city bounds.",
                },
            )


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)
    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return 6371.0 * c


@router.get("", response_model=list[ItemResponse])
def list_items(
    category_id: int | None = None,
    listing_type: ListingType | None = None,
    delivery_option: DeliveryOption | None = None,
    q: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    sort: str = "newest",
    limit: int = Query(default=20, ge=1, le=100),
    cursor: int | None = None,
    db: Session = Depends(get_db),
) -> list[ItemResponse]:
    now = datetime.now(UTC)
    query = (
        db.query(Item)
        .join(User, Item.owner_id == User.id)
        .filter(User.status == UserStatus.active)
        .filter(Item.status == ItemStatus.available)
    )

    if category_id is not None:
        query = query.filter(Item.category_id == category_id)
    if listing_type is not None:
        query = query.filter(Item.listing_type == listing_type)
    if delivery_option is not None:
        query = query.filter(Item.delivery_option == delivery_option)
    if q:
        text = f"%{q.strip()}%"
        query = query.filter(or_(Item.title.ilike(text), Item.description.ilike(text)))
    if cursor is not None:
        query = query.filter(Item.id < cursor)

    items = query.order_by(Item.created_at.desc()).all()

    visible_items = []
    for item in items:
        expires_at = _normalize_utc(item.expires_at)
        if expires_at is not None and expires_at <= now:
            continue
        if item.lat is None or item.lng is None:
            if lat is not None and lng is not None and radius_km is not None:
                continue
            visible_items.append(item)
            continue
        if lat is not None and lng is not None and radius_km is not None:
            distance_km = _haversine_km(float(lat), float(lng), float(item.lat), float(item.lng))
            if distance_km <= radius_km:
                visible_items.append(item)
            continue
        visible_items.append(item)

    if lat is not None and lng is not None and radius_km is not None:
        visible_items.sort(
            key=lambda item: _haversine_km(float(lat), float(lng), float(item.lat), float(item.lng))
            if item.lat is not None and item.lng is not None
            else float("inf")
        )
        if sort == "newest":
            visible_items.sort(key=lambda item: item.created_at, reverse=True)
    elif sort == "distance":
        visible_items.sort(key=lambda item: item.created_at, reverse=True)

    return [ItemResponse.model_validate(item) for item in visible_items[:limit]]


@router.get("/nearby", response_model=list[ItemResponse])
def nearby_items(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=5.0, ge=0.1, le=50),
    limit: int = Query(default=20, ge=1, le=20),
    db: Session = Depends(get_db),
) -> list[ItemResponse]:
    now = datetime.now(UTC)
    items = (
        db.query(Item)
        .join(User, Item.owner_id == User.id)
        .filter(User.status == UserStatus.active)
        .filter(Item.status == ItemStatus.available)
        .all()
    )

    nearby = []
    for item in items:
        expires_at = _normalize_utc(item.expires_at)
        if expires_at is not None and expires_at <= now:
            continue
        if item.lat is None or item.lng is None:
            continue
        distance_km = _haversine_km(lat, lng, float(item.lat), float(item.lng))
        if distance_km <= radius_km:
            nearby.append((distance_km, item))

    nearby.sort(key=lambda pair: pair[0])
    return [ItemResponse.model_validate(item) for _, item in nearby[:limit]]


@router.post("/uploads/sign")
def sign_upload(current_user: User = Depends(get_current_user)) -> dict[str, str]:
    settings = get_settings()
    return {
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "api_key": settings.CLOUDINARY_API_KEY,
        "folder": "reuse-marketplace",
        "message": "Signed upload support is ready for the frontend integration.",
    }


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    body: ItemCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemResponse:
    _validate_listing_payload(body)

    settings = get_settings()
    category = db.get(Category, body.category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "category_not_found", "message": "Category not found."},
        )

    created_at = _normalize_utc(current_user.created_at) or datetime.now(UTC)
    user_age_days = (datetime.now(UTC) - created_at).total_seconds() / 86400
    if user_age_days <= settings.NEW_ACCOUNT_DAYS:
        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = (
            db.query(Item)
            .filter(
                Item.owner_id == current_user.id,
                _normalize_utc(Item.created_at) >= today_start,
            )
            .count()
        )
        if today_count >= settings.NEW_ACCOUNT_DAILY_LISTINGS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "daily_listing_limit_reached",
                    "message": "New accounts can create only a limited number of listings per day.",
                },
            )

    if body.listing_type == ListingType.donation:
        delivery_option = DeliveryOption.pickup
        shipping_cost_payer = None
        shipping_notes = None
        price = None
    else:
        delivery_option = body.delivery_option
        shipping_cost_payer = body.shipping_cost_payer
        shipping_notes = body.shipping_notes
        price = body.price

    item = Item(
        owner_id=current_user.id,
        title=body.title,
        description=body.description,
        category_id=body.category_id,
        listing_type=body.listing_type,
        price=price,
        delivery_option=delivery_option,
        shipping_cost_payer=shipping_cost_payer,
        shipping_notes=shipping_notes,
        lat=round(body.lat, settings.COORD_DECIMALS) if body.lat is not None else None,
        lng=round(body.lng, settings.COORD_DECIMALS) if body.lng is not None else None,
        area_label=body.area_label,
        photos=list(body.photos),
        status=ItemStatus.available,
        last_activity_at=datetime.now(UTC),
        expires_at=datetime.now(UTC) + timedelta(days=settings.LISTING_TTL_DAYS),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)


@router.get("/me", response_model=list[ItemResponse])
def get_my_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ItemResponse]:
    items = (
        db.query(Item)
        .filter(Item.owner_id == current_user.id)
        .order_by(Item.created_at.desc())
        .all()
    )
    return [ItemResponse.model_validate(item) for item in items]


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)) -> ItemResponse:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "item_not_found", "message": "Item not found."},
        )
    return ItemResponse.model_validate(item)


@router.patch("/{item_id}", response_model=ItemResponse)
def patch_item(
    item_id: int,
    body: ItemPatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemResponse:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "item_not_found", "message": "Item not found."},
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "not_owner", "message": "Only the owner can edit a listing."},
        )

    if body.listing_type is not None:
        item.listing_type = body.listing_type
    if body.price is not None:
        item.price = body.price
    if body.delivery_option is not None:
        item.delivery_option = body.delivery_option
    if body.shipping_cost_payer is not None:
        item.shipping_cost_payer = body.shipping_cost_payer
    if body.shipping_notes is not None:
        item.shipping_notes = body.shipping_notes
    if body.title is not None:
        item.title = body.title
    if body.description is not None:
        item.description = body.description
    if body.category_id is not None:
        item.category_id = body.category_id
    if body.area_label is not None:
        item.area_label = body.area_label
    if body.lat is not None:
        item.lat = round(body.lat, get_settings().COORD_DECIMALS)
    if body.lng is not None:
        item.lng = round(body.lng, get_settings().COORD_DECIMALS)
    if body.photos is not None:
        item.photos = list(body.photos)

    if item.listing_type == ListingType.donation:
        item.delivery_option = DeliveryOption.pickup
        item.shipping_cost_payer = None
        item.shipping_notes = None
        item.price = None

    _validate_listing_payload(
        ItemCreateRequest(
            title=item.title,
            description=item.description,
            category_id=item.category_id,
            listing_type=item.listing_type,
            price=item.price,
            delivery_option=item.delivery_option,
            shipping_cost_payer=item.shipping_cost_payer,
            shipping_notes=item.shipping_notes,
            photos=item.photos,
            lat=item.lat,
            lng=item.lng,
            area_label=item.area_label,
            prohibited_items_confirmed=True,
        )
    )

    now = datetime.now(UTC)
    item.last_activity_at = now
    item.expires_at = now + timedelta(days=get_settings().LISTING_TTL_DAYS)
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "item_not_found", "message": "Item not found."},
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "not_owner", "message": "Only the owner can delete a listing."},
        )
    db.delete(item)
    db.commit()


@router.post("/{item_id}/renew", response_model=ItemResponse)
def renew_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemResponse:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "item_not_found", "message": "Item not found."},
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "not_owner", "message": "Only the owner can renew a listing."},
        )
    now = datetime.now(UTC)
    item.last_activity_at = now
    item.expires_at = now + timedelta(days=get_settings().LISTING_TTL_DAYS)
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)


@router.post("/{item_id}/status", response_model=ItemResponse)
def update_item_status(
    item_id: int,
    body: ItemStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ItemResponse:
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "item_not_found", "message": "Item not found."},
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "not_owner", "message": "Only the owner can update listing status."},
        )
    item.status = ItemStatus(body.status)
    if item.status == ItemStatus.hidden:
        item.hidden_reason = HiddenReason.owner
    else:
        item.hidden_reason = None
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)
