"""
app/main.py — Lumora AI FastAPI application entry point.

This file:
  1. Configures structured logging.
  2. Defines the async lifespan context (MongoDB connect/disconnect + Beanie init).
  3. Registers all middleware (CORS, request logging).
  4. Mounts all route groups under /api.
  5. Exposes the GET /health endpoint.

Environment variables required
-------------------------------
  MONGODB_URI    — MongoDB Atlas connection string
  DATABASE_NAME  — Atlas database name  (default: lumora)

See .env.example for the full list.

Running locally
---------------
    uvicorn app.main:app --reload        # development
    python run.py                        # convenience wrapper
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Internal imports ──────────────────────────────────────────────────────────
from app.config import get_settings
from app.middleware import RequestLoggingMiddleware
from app.middleware.cors_middleware import cors_origins

# Route façades (app/routes/) — canonical import path as per spec
from app.routes import auth, projects, stories, characters, ai as ai_routes

# Legacy routers still needed for prompts / worlds (not yet in routes/)
from app.routers import prompts, worlds

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger   = logging.getLogger(__name__)
settings = get_settings()


# ══════════════════════════════════════════════════════════════════════════════
# Lifespan — startup + shutdown
# ══════════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Async context manager that wraps application startup and shutdown.

    Startup sequence
    ----------------
    1. Connect to MongoDB Atlas via Motor and ping to verify connectivity.
    2. Initialise Beanie ODM with all document models so indexes are created.
    3. Log the environment, AI state, and Watsonx configuration.

    Shutdown sequence
    -----------------
    1. Close the shared httpx client used by GraniteClient.
    2. Close the Motor MongoDB connection gracefully.
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info(
        "🚀  Lumora AI starting — env=%s  ai=%s  watsonx=%s",
        settings.app_env,
        "enabled" if settings.ai_enabled else "disabled",
        "configured" if settings.watsonx_configured else "mock mode",
    )

    # Step 1 — connect to MongoDB Atlas
    from app.database import connect_db, close_db as _close_db

    try:
        await connect_db()
    except Exception as exc:                      # noqa: BLE001
        # Non-fatal: API starts up but DB-dependent routes will fail.
        # This allows health probes to still respond during partial outages.
        logger.error(
            "❌  MongoDB connection failed: %s — "
            "database endpoints will be unavailable until reconnected.",
            exc,
        )

    # Step 2 — initialise Beanie ODM (optional; wraps Motor for document models)
    try:
        from beanie import init_beanie
        from app.database import get_db
        from app.models import ALL_MODELS

        await init_beanie(database=get_db(), document_models=ALL_MODELS)
        logger.info(
            "🍃  Beanie ODM ready — db=%s  collections=%s",
            settings.database_name,
            ", ".join(m.Settings.name for m in ALL_MODELS),  # type: ignore[attr-defined]
        )
    except Exception as exc:                      # noqa: BLE001
        logger.warning("Beanie ODM init skipped: %s", exc)

    # ── Yield (app runs) ──────────────────────────────────────────────────────
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    # Close the Granite httpx client first (in-flight requests finish)
    try:
        from app.services.granite import granite_client
        await granite_client.close()
        logger.info("🔒  IBM Granite HTTP client closed.")
    except Exception as exc:                      # noqa: BLE001
        logger.warning("Granite client close error: %s", exc)

    # Close Motor connection last
    await _close_db()
    logger.info("👋  Lumora AI shut down cleanly.")


# ══════════════════════════════════════════════════════════════════════════════
# App factory
# ══════════════════════════════════════════════════════════════════════════════

def create_app() -> FastAPI:
    """
    Build and return the configured FastAPI application.

    Separated from module-level ``app`` creation so the factory can be
    reused in tests without triggering side-effects at import time.
    """
    application = FastAPI(
        title="Lumora AI",
        description=(
            "REST API for Lumora AI — an AI-powered creative workspace "
            "for stories, characters, worlds, and storyboards. "
            "Powered by IBM Granite foundation models."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
        contact={
            "name":  "Lumora AI — IBM SkillsBuild Hackathon",
            "email": "team@lumora.ai",
        },
    )

    # ── Middleware ─────────────────────────────────────────────────────────────
    # Order matters: middleware is applied innermost-first (last added = first run).

    # 1. CORS — must be outermost so pre-flight OPTIONS requests are handled
    #           before any auth or logging middleware fires.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins(),   # reads APP_CORS_ORIGINS from settings
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Request logging — structured timing + status log for every request.
    #    Health-check pings are logged at DEBUG to reduce noise.
    application.add_middleware(RequestLoggingMiddleware)

    # ── Routes ────────────────────────────────────────────────────────────────
    # All routes are grouped under /api for clean versioning.
    # Using the new app/routes/ façade as the canonical import path.

    application.include_router(auth.router,        prefix="/api")   # /api/auth/*
    application.include_router(projects.router,    prefix="/api")   # /api/projects/*
    application.include_router(stories.router,     prefix="/api")   # /api/projects/{id}/stories/*
    application.include_router(characters.router,  prefix="/api")   # /api/projects/{id}/characters/*
    application.include_router(ai_routes.router,   prefix="/api")   # /api/granite/*
    application.include_router(worlds.router,      prefix="/api")   # /api/projects/{id}/worlds/*
    application.include_router(prompts.router,     prefix="/api")   # /api/prompts/*

    # ── Health endpoint ────────────────────────────────────────────────────────
    @application.get(
        "/health",
        tags=["health"],
        summary="Application health check",
        response_description="Returns healthy status and database connectivity",
    )
    async def health() -> dict:
        """
        Lightweight liveness + readiness probe.

        Returns the minimal payload required by the hackathon spec:

            {
                "status":   "healthy",
                "database": "connected" | "disconnected" | "unreachable"
            }

        Used by:
        - Kubernetes / Cloud Foundry readiness probes
        - Load-balancer health checks
        - CI/CD smoke tests after deployment
        """
        from app.database import get_db

        db_status = "disconnected"
        try:
            # Lightweight server round-trip — does not read/write any data
            await get_db().client.admin.command("ping")
            db_status = "connected"
        except Exception:                           # noqa: BLE001
            db_status = "unreachable"

        return {
            "status":   "healthy",
            "database": db_status,
        }

    return application


# ── Module-level app instance (used by uvicorn) ───────────────────────────────
app = create_app()
