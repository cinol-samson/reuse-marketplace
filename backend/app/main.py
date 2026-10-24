from __future__ import annotations

import logging
import typing
import uuid

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import init_db
from app.limiter import limiter
from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.items import router as items_router
from app.routes.users import router as users_router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s %(message)s",
)

# ── App factory ────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Reuse Marketplace API",
        version="0.1.0",
        description="Desktop-first marketplace for reusing, donating, and upcycling items.",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

    # Request-ID middleware for structured logging
    @app.middleware("http")
    async def add_request_id(
        request: Request, call_next: typing.Callable[[Request], typing.Awaitable[Response]]
    ) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    # Standardised error format
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error [%s]", getattr(request.state, "request_id", "-"))
        return JSONResponse(
            status_code=500,
            content={
                "error": {"code": "internal_error", "message": "An unexpected error occurred."}
            },
        )

    # Startup: create tables and seed categories
    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        logger.info("Database initialised.")

    # Routers
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(items_router, prefix="/api/v1")
    app.include_router(users_router, prefix="/api/v1")

    return app


app = create_app()
