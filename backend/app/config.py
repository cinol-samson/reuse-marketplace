from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Database ──────────────────────────────────────────
    DATABASE_URL: str = "postgresql://reuse:reuse@localhost:5432/reuse"

    # ── Auth ──────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production"
    JWT_EXPIRE_DAYS: int = 7

    # ── Admin ─────────────────────────────────────────────
    ADMIN_EMAIL: str | None = None

    # ── Cloudinary ────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # ── AI ────────────────────────────────────────────────
    AI_MODEL: str = "claude-3-5-haiku-latest"
    ANTHROPIC_API_KEY: str | None = None

    # ── CORS ──────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    # ── Listing rules ─────────────────────────────────────
    LISTING_TTL_DAYS: int = 60
    EXPIRY_REMINDER_DAYS: int = 7
    RESERVATION_DAYS_PICKUP: int = 3
    RESERVATION_DAYS_SHIPPING: int = 7
    RESERVATION_REMINDER_HOURS: int = 24
    MAX_EXTENSIONS: int = 2
    REQUEST_PENDING_DAYS: int = 5
    CHAT_RETENTION_DAYS: int = 60
    MAX_MESSAGE_CHARS: int = 2000
    NEARBY_DEFAULT_RADIUS_KM: float = 5.0
    COORD_DECIMALS: int = 3
    MAX_PHOTOS_ITEM: int = 5
    MAX_PHOTOS_POST: int = 3
    MAX_MENTIONS_PER_ITEM: int = 3
    RECOMMEND_DAILY_LIMIT: int = 10
    AI_DAILY_LIMIT: int = 10
    REPORT_AUTOHIDE_THRESHOLD: int = 3
    NEW_ACCOUNT_DAYS: int = 7
    NEW_ACCOUNT_DAILY_LISTINGS: int = 5
    MAX_PAIR_EXCHANGES_PER_30_DAYS: int = 2
    LAUNCH_BBOX: str | None = None  # "min_lat,min_lng,max_lat,max_lng"
    PROHIBITED_KEYWORDS: str = "firearm,ammunition,explosive,prescription,narcotic,stolen"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def prohibited_keywords_list(self) -> list[str]:
        return [k.strip().lower() for k in self.PROHIBITED_KEYWORDS.split(",") if k.strip()]

    @property
    def launch_bbox_tuple(self) -> tuple[float, float, float, float] | None:
        if not self.LAUNCH_BBOX:
            return None
        parts = [float(p.strip()) for p in self.LAUNCH_BBOX.split(",")]
        if len(parts) != 4:
            raise ValueError("LAUNCH_BBOX must be 'min_lat,min_lng,max_lat,max_lng'")
        return (parts[0], parts[1], parts[2], parts[3])


@lru_cache
def get_settings() -> Settings:
    return Settings()
