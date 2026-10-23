from __future__ import annotations

from sqlalchemy.orm import Session

CATEGORY_NAMES = [
    "Textiles/Clothes",
    "Wood",
    "Metal",
    "Glass",
    "Paper/Cardboard",
    "Plastic",
    "Electronics/Parts",
    "Furniture",
    "Books",
    "Craft Supplies",
    "Other",
]


def seed_categories(db: Session) -> None:
    """Insert any missing categories. Idempotent."""
    from app.models import Category

    existing = {c.name for c in db.query(Category).all()}
    for name in CATEGORY_NAMES:
        if name not in existing:
            db.add(Category(name=name))
    db.commit()
