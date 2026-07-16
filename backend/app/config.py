"""
app/config.py — Top-level configuration entry point for Lumora AI.

This module is the single authoritative place for all runtime settings.
Values are read from environment variables or a ``.env`` file at the
project root.  All secrets are kept out of source control.

Required environment variables
-------------------------------
MONGODB_URI   — MongoDB Atlas connection string
DATABASE_NAME — Target database name inside the Atlas cluster

Optional environment variables (have sensible defaults)
-------------------------------------------------------
APP_ENV                 — deployment environment (development | production)
APP_CORS_ORIGINS        — comma-separated list of allowed origins
JWT_SECRET              — HMAC secret for signing JWTs
WATSONX_API_KEY         — IBM watsonx API key (enables real Granite calls)
WATSONX_PROJECT_ID      — IBM watsonx project ID

Usage
-----
    from app.config import get_settings, Settings

    settings = get_settings()
    uri      = settings.mongodb_uri
    db_name  = settings.database_name
"""

from __future__ import annotations

# Re-export everything from the canonical config module so callers can
# import from either ``app.config`` or ``app.core.config``.
from app.core.config import Settings, get_settings  # noqa: F401

__all__ = ["Settings", "get_settings"]
