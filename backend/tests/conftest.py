from __future__ import annotations

import os
import socket

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


def _is_postgres_reachable(host: str = "localhost", port: int = 5433, timeout: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


# ── Use test database ──────────────────────────────────────────────────────
raw_test_url = os.getenv(
    "TEST_DATABASE_URL", "postgresql://reuse_test:reuse_test@localhost:5433/reuse_test"
)
TEST_DATABASE_URL = (
    raw_test_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if raw_test_url.startswith("postgresql://")
    else raw_test_url
)

USE_POSTGRES = _is_postgres_reachable(port=5433)
if not USE_POSTGRES:
    TEST_DATABASE_URL = "sqlite:///:memory:"

# Override config before importing app
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET"] = "test-secret-key"
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")


@pytest.fixture(scope="session")
def engine():
    from app import models  # noqa: F401 – ensures models are registered on Base
    from app.database import Base

    if USE_POSTGRES:
        eng = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    else:
        eng = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    Base.metadata.create_all(bind=eng)
    yield eng
    Base.metadata.drop_all(bind=eng)
    eng.dispose()


@pytest.fixture(scope="function")
def db(engine):
    """Provide a clean database session per test, rolling back after each."""
    from app.database import Base
    from app.seed import seed_categories

    # Truncate all tables between tests for isolation
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())

    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = testing_session_local()
    seed_categories(session)
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db):
    """FastAPI test client with the test DB session injected."""
    from app.database import get_db
    from app.main import app

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()
