"""
app/middleware/logging_middleware.py — Structured request / response logging.

Logs every HTTP request with method, path, status code, and elapsed time.
In production this feeds directly into your observability pipeline (e.g.
Datadog, Grafana Loki, IBM Log Analysis).

Example log line
----------------
    2024-01-15 12:00:01 | INFO     | lumora.http | POST /api/projects → 201  (34.2ms)

Usage (applied automatically in main.py)
-----------------------------------------
    from app.middleware import RequestLoggingMiddleware
    app.add_middleware(RequestLoggingMiddleware)
"""

from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Dedicated logger — keeps HTTP noise separate from business logic logs
logger = logging.getLogger("lumora.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    ASGI middleware that logs method, path, status, and latency for every request.

    Skips noisy health-check pings (``/health``) at DEBUG level so production
    log streams don't fill up with readiness-probe noise.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start     = time.perf_counter()
        response  = await call_next(request)
        elapsed   = (time.perf_counter() - start) * 1000   # milliseconds

        # Downgrade health-check traffic to DEBUG to reduce noise
        level = logging.DEBUG if request.url.path == "/health" else logging.INFO

        logger.log(
            level,
            "%s %s → %d  (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response
