"""
app/middleware/cors_middleware.py — CORS policy configuration helpers.

Lumora AI's CORS policy is applied in ``app/main.py`` using FastAPI's
built-in ``CORSMiddleware``.  This module provides the helper function
``cors_origins()`` that reads the allowed-origins list from settings so
the policy is configured from environment variables, not hard-coded.

Example .env values
-------------------
    # Development — allow the local Next.js dev server
    APP_CORS_ORIGINS=http://localhost:3000

    # Production — lock down to your deployed frontend domain
    APP_CORS_ORIGINS=https://lumora.ai,https://www.lumora.ai

Usage (called in main.py)
--------------------------
    from app.middleware.cors_middleware import cors_origins
    app.add_middleware(CORSMiddleware, allow_origins=cors_origins(), ...)
"""

from __future__ import annotations

from app.core.config import get_settings


def cors_origins() -> list[str]:
    """
    Return the list of allowed CORS origins from settings.

    Reads ``APP_CORS_ORIGINS`` (comma-separated) from the environment.
    Defaults to ``http://localhost:3000`` in development.
    """
    return get_settings().cors_origins_list
