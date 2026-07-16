"""
app/database.py — Async MongoDB connection manager for Lumora AI.

Provides a reusable AsyncIOMotorClient and exposes the active database
instance.  Motor is used directly (no ODM) so any collection can be
accessed via ``get_db()``.

Usage
-----
    from app.database import get_db

    db = get_db()
    doc = await db["users"].find_one({"email": email})

Lifecycle
---------
Call ``connect_db()`` once on application startup and ``close_db()``
once on shutdown.  Both are wired into the FastAPI lifespan in main.py.
"""

from __future__ import annotations

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── Module-level singletons ───────────────────────────────────────────────────

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


# ── Public helpers ────────────────────────────────────────────────────────────

def get_db() -> AsyncIOMotorDatabase:
    """Return the active database instance.

    Raises
    ------
    RuntimeError
        If called before ``connect_db()`` has been awaited.
    """
    if _db is None:
        raise RuntimeError(
            "Database is not initialised. "
            "Ensure connect_db() is called during application startup."
        )
    return _db


async def connect_db() -> None:
    """Initialise the Motor client and verify connectivity with a ping.

    On success the module-level ``_client`` and ``_db`` singletons are
    set and a confirmation message is logged.  Raises on connection
    failure so the application can decide whether to abort startup.
    """
    global _client, _db

    settings = get_settings()

    logger.info(
        "Connecting to MongoDB Atlas — db=%s",
        settings.database_name,
    )

    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        # Keep the connection pool from blocking the event loop on startup
        serverSelectionTimeoutMS=5_000,
    )

    # Ping the deployment to confirm the connection is alive
    await _client.admin.command("ping")

    _db = _client[settings.database_name]

    logger.info("✅  Connected to MongoDB Atlas — db=%s", settings.database_name)
    print("Connected to MongoDB Atlas")


async def close_db() -> None:
    """Close the Motor client gracefully during application shutdown."""
    global _client, _db

    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("🔒  MongoDB connection closed.")
