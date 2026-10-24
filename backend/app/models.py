from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# ── Enums ──────────────────────────────────────────────────────────────────


class UserStatus(enum.StrEnum):
    active = "active"
    suspended = "suspended"
    deleted = "deleted"


class ItemStatus(enum.StrEnum):
    available = "available"
    reserved = "reserved"
    completed = "completed"
    hidden = "hidden"
    removed = "removed"


class HiddenReason(enum.StrEnum):
    owner = "owner"
    expired = "expired"
    reports = "reports"
    admin = "admin"


class ListingType(enum.StrEnum):
    sale = "sale"
    donation = "donation"


class DeliveryOption(enum.StrEnum):
    pickup = "pickup"
    shipping = "shipping"
    both = "both"


class ShippingCostPayer(enum.StrEnum):
    buyer = "buyer"
    seller = "seller"
    split_cost = "split"


class RequestStatus(enum.StrEnum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    cancelled = "cancelled"
    expired = "expired"
    completed = "completed"


class DeliveryChoice(enum.StrEnum):
    pickup = "pickup"
    shipping = "shipping"


class NotificationType(enum.StrEnum):
    request_received = "request_received"
    request_accepted = "request_accepted"
    request_declined = "request_declined"
    request_auto_declined = "request_auto_declined"
    request_cancelled = "request_cancelled"
    request_expired = "request_expired"
    reservation_expiring = "reservation_expiring"
    reservation_extended = "reservation_extended"
    exchange_completed = "exchange_completed"
    listing_expiring = "listing_expiring"
    mention_received = "mention_received"
    recommendation_received = "recommendation_received"
    new_message = "new_message"
    report_resolved = "report_resolved"


class ReportTargetType(enum.StrEnum):
    item = "item"
    artist_post = "artist_post"
    creation = "creation"
    user = "user"
    message_thread = "message_thread"


class ReportReason(enum.StrEnum):
    not_as_described = "not_as_described"
    prohibited_item = "prohibited_item"
    scam_spam = "scam_spam"
    harassment = "harassment"
    unsafe = "unsafe"
    other = "other"


class ReportStatus(enum.StrEnum):
    open = "open"
    dismissed = "dismissed"
    actioned = "actioned"


class ArtistPostStatus(enum.StrEnum):
    open = "open"
    closed = "closed"
    hidden = "hidden"


class CreationStatus(enum.StrEnum):
    visible = "visible"
    hidden = "hidden"


class AIRequestStatus(enum.StrEnum):
    success = "success"
    failed = "failed"


# ── Models ─────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_artist: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_rag_picker: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_discoverable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    home_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    home_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    home_area_label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.active, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    items = relationship("Item", back_populates="owner", foreign_keys="Item.owner_id")
    artist_posts = relationship("ArtistPost", back_populates="author")
    creations = relationship("Creation", back_populates="author")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    items = relationship("Item", back_populates="category")
    artist_posts = relationship("ArtistPost", back_populates="category")


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False)
    listing_type: Mapped[ListingType] = mapped_column(Enum(ListingType), nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    delivery_option: Mapped[DeliveryOption] = mapped_column(Enum(DeliveryOption), nullable=False)
    shipping_cost_payer: Mapped[ShippingCostPayer | None] = mapped_column(
        Enum(ShippingCostPayer), nullable=True
    )
    shipping_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    area_label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    photos: Mapped[list[Any]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[ItemStatus] = mapped_column(
        Enum(ItemStatus), default=ItemStatus.available, nullable=False
    )
    hidden_reason: Mapped[HiddenReason | None] = mapped_column(
        Enum(HiddenReason), nullable=True
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expiry_reminder_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    owner = relationship("User", back_populates="items", foreign_keys=[owner_id])
    category = relationship("Category", back_populates="items")
    requests = relationship("Request", back_populates="item")
    mentions = relationship("ItemMention", back_populates="item")
    recommendations = relationship("ItemRecommendation", back_populates="item")


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("items.id"), nullable=False)
    requester_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    delivery_choice: Mapped[DeliveryChoice] = mapped_column(Enum(DeliveryChoice), nullable=False)
    terms_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus), default=RequestStatus.pending, nullable=False
    )
    pending_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reservation_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    reminder_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    extension_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    counts_toward_total: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    requester_last_read_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    owner_last_read_message_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    item = relationship("Item", back_populates="requests")
    requester = relationship("User", foreign_keys=[requester_id])
    messages = relationship("Message", back_populates="request")

    __table_args__ = (
        # Unique partial index: only one accepted request per item
        Index(
            "ix_requests_one_accepted_per_item",
            "item_id",
            unique=True,
            postgresql_where="status = 'accepted'",
        ),
        # Unique: one pending or accepted request per (item, requester)
        Index(
            "ix_requests_one_active_per_requester",
            "item_id",
            "requester_id",
            unique=True,
            postgresql_where="status IN ('pending', 'accepted')",
        ),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("requests.id"), nullable=False)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    request = relationship("Request", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", foreign_keys=[user_id])


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reporter_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    target_type: Mapped[ReportTargetType] = mapped_column(Enum(ReportTargetType), nullable=False)
    target_id: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[ReportReason] = mapped_column(Enum(ReportReason), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    message_snapshot: Mapped[list[Any] | None] = mapped_column(JSON, nullable=True)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus), default=ReportStatus.open, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id])


class Block(Base):
    __tablename__ = "blocks"

    blocker_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), primary_key=True, nullable=False
    )
    blocked_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), primary_key=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    blocker = relationship("User", foreign_keys=[blocker_id])
    blocked = relationship("User", foreign_keys=[blocked_id])


class ArtistPost(Base):
    __tablename__ = "artist_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    photos: Mapped[list[Any]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[ArtistPostStatus] = mapped_column(
        Enum(ArtistPostStatus), default=ArtistPostStatus.open, nullable=False
    )
    hidden_reason: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    author = relationship("User", back_populates="artist_posts")
    category = relationship("Category", back_populates="artist_posts")
    mentions = relationship("ItemMention", back_populates="artist_post")
    recommendations = relationship("ItemRecommendation", back_populates="artist_post")


class ItemMention(Base):
    __tablename__ = "item_mentions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("items.id"), nullable=False)
    mentioned_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    artist_post_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("artist_posts.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    item = relationship("Item", back_populates="mentions")
    artist_post = relationship("ArtistPost", back_populates="mentions")

    __table_args__ = (
        Index("ix_item_mentions_unique", "item_id", "mentioned_user_id", unique=True),
    )


class ItemRecommendation(Base):
    __tablename__ = "item_recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(Integer, ForeignKey("items.id"), nullable=False)
    artist_post_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("artist_posts.id"), nullable=False
    )
    recommended_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    item = relationship("Item", back_populates="recommendations")
    artist_post = relationship("ArtistPost", back_populates="recommendations")

    __table_args__ = (
        Index(
            "ix_item_recommendations_unique",
            "item_id",
            "artist_post_id",
            "recommended_by",
            unique=True,
        ),
    )


class Creation(Base):
    __tablename__ = "creations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    photos: Mapped[list[Any]] = mapped_column(JSON, default=list, nullable=False)
    source_item_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("items.id"), nullable=True
    )
    ai_idea_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[CreationStatus] = mapped_column(
        Enum(CreationStatus), default=CreationStatus.visible, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    author = relationship("User", back_populates="creations")


class AIIdeaRequest(Base):
    __tablename__ = "ai_idea_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    status: Mapped[AIRequestStatus] = mapped_column(Enum(AIRequestStatus), nullable=False)

    user = relationship("User", foreign_keys=[user_id])
