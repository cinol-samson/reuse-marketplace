from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.models import Category, Item, ItemStatus


def _create_user_and_token(client, email="owner@example.com", password="SecurePass1"):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "display_name": "Owner",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["access_token"]


def _category_id(db):
    return db.query(Category).first().id


def test_nearby_items_filter_and_radius(client, db):
    token = _create_user_and_token(client, email="owner@example.com")
    category_id = _category_id(db)

    owner = db.query(db.get_bind().engine if False else object()).all() if False else None

    near_item = Item(
        owner_id=1,
        title="Near item",
        description="Within radius.",
        category_id=category_id,
        listing_type="sale",
        price=25.0,
        delivery_option="pickup",
        lat=12.9716,
        lng=77.5946,
        area_label="Indiranagar",
        photos=["https://res.cloudinary.com/demo/image/upload/v1740000000/reuse/item-a.jpg"],
        status=ItemStatus.available,
        last_activity_at=datetime.now(UTC),
        expires_at=datetime.now(UTC) + timedelta(days=30),
    )
    far_item = Item(
        owner_id=1,
        title="Far item",
        description="Outside radius.",
        category_id=category_id,
        listing_type="sale",
        price=30.0,
        delivery_option="pickup",
        lat=19.0760,
        lng=72.8777,
        area_label="Mumbai",
        photos=["https://res.cloudinary.com/demo/image/upload/v1740000000/reuse/item-b.jpg"],
        status=ItemStatus.available,
        last_activity_at=datetime.now(UTC),
        expires_at=datetime.now(UTC) + timedelta(days=30),
    )
    db.add_all([near_item, far_item])
    db.commit()

    response = client.get(
        "/api/v1/items/nearby?lat=12.9716&lng=77.5946&radius_km=15",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Near item"
