"""
app/routes/ai.py — IBM Granite AI route façade.

Exposes the Granite router under the canonical ``app/routes/ai`` path.

Routes (mounted at /api in main.py)
------------------------------------
POST   /api/granite/generate          — single-turn text generation  → GraniteGenerateResponse
POST   /api/granite/generate/stream   — streaming text (SSE)         → text/event-stream
POST   /api/granite/imagine           — image generation (stub)      → ImagineResponse
GET    /api/granite/models            — list available models        → {models: [...]}

IBM Granite models available
-----------------------------
    ibm/granite-13b-instruct-v2     — main creative writing model
    ibm/granite-20b-code-instruct-v2 — code generation
    ibm/granite-vision-3-2-2b       — image understanding (vision)

Configuration
-------------
Set ``WATSONX_API_KEY`` and ``WATSONX_PROJECT_ID`` in ``.env`` to enable
real Granite calls.  Without these the API returns safe mock responses so
the frontend stays functional during development and demos.

Implementation
--------------
Full logic lives in ``app/routers/granite.py`` +
``app/services/granite.py`` (GraniteClient with IAM token caching,
exponential backoff, and SSE streaming).
"""

from app.routers.granite import router  # re-export

__all__ = ["router"]
