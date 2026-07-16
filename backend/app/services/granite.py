"""
app/services/granite.py — IBM Watsonx / Granite async client.

Features
--------
- IAM token caching with automatic expiry refresh
- Exponential-backoff retry on transient network errors
- Graceful mock mode when WATSONX_API_KEY is not configured
- Async generate, stream (SSE), and imagine (stub) methods
"""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone
from typing import AsyncGenerator

import httpx

from app.core.config import get_settings

logger   = logging.getLogger(__name__)
settings = get_settings()

# ── Model IDs ─────────────────────────────────────────────────────────────────
GRANITE_TEXT_MODEL   = "ibm/granite-13b-instruct-v2"
GRANITE_CODE_MODEL   = "ibm/granite-20b-code-instruct-v2"
GRANITE_VISION_MODEL = "ibm/granite-vision-3-2-2b"

# ── Mock responses (used when Watsonx is not configured) ──────────────────────
_MOCK_TEXT = (
    "This is a mock response from Lumora AI. "
    "Configure WATSONX_API_KEY and WATSONX_PROJECT_ID to enable real IBM Granite generation."
)


class GraniteClient:
    """
    Thin async wrapper around the IBM Watsonx text generation REST API.

    Thread-safe for a single event loop.  In production, consider using
    a connection pool (the httpx.AsyncClient is reused across requests).
    """

    def __init__(self) -> None:
        self._api_key      = settings.watsonx_api_key
        self._project_id   = settings.watsonx_project_id
        self._base_url     = settings.watsonx_url
        self._iam_token: str | None  = None
        self._token_expiry: float    = 0.0   # Unix timestamp
        self._http: httpx.AsyncClient | None = None

    # ── Lifecycle ────────────────────────────────────────────────────────────

    async def _get_http(self) -> httpx.AsyncClient:
        if self._http is None or self._http.is_closed:
            self._http = httpx.AsyncClient(timeout=httpx.Timeout(90.0, connect=10.0))
        return self._http

    async def close(self) -> None:
        if self._http and not self._http.is_closed:
            await self._http.aclose()

    # ── IAM token management (cached, auto-refresh) ──────────────────────────

    async def _get_iam_token(self) -> str:
        """Return a valid IAM bearer token, refreshing ~5 min before expiry."""
        now = time.time()
        if self._iam_token and now < self._token_expiry - 300:
            return self._iam_token

        logger.debug("Refreshing IBM IAM token…")
        client = await self._get_http()
        resp = await client.post(
            "https://iam.cloud.ibm.com/identity/token",
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": self._api_key,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        data = resp.json()
        self._iam_token  = data["access_token"]
        self._token_expiry = now + data.get("expires_in", 3600)
        return self._iam_token

    # ── Mock helpers ──────────────────────────────────────────────────────────

    def _is_configured(self) -> bool:
        return settings.watsonx_configured

    def _mock_response(self, prompt: str, prefix: str = "") -> str:
        label = prefix or "IBM Granite"
        return f"[{label} mock] Prompt received: '{prompt[:80]}…'\n\n{_MOCK_TEXT}"

    # ── Core: single-turn generation ─────────────────────────────────────────

    async def generate(
        self,
        prompt: str,
        model_id: str | None = None,
        max_new_tokens: int | None = None,
        temperature: float | None = None,
        top_p: float = 0.9,
        stop_sequences: list[str] | None = None,
    ) -> str:
        """
        Generate text with an IBM Granite model.

        Returns the generated text string.
        Falls back to a mock string when Watsonx is not configured.
        """
        if not self._is_configured():
            if settings.ai_mock_when_unconfigured:
                logger.warning("Watsonx not configured — returning mock response.")
                return self._mock_response(prompt)
            raise RuntimeError("IBM Watsonx is not configured. Set WATSONX_API_KEY and WATSONX_PROJECT_ID.")

        token    = await self._get_iam_token()
        model    = model_id or settings.watsonx_default_model
        max_tok  = max_new_tokens or settings.watsonx_max_tokens_default
        temp     = temperature if temperature is not None else settings.watsonx_temperature_default
        url      = f"{self._base_url}/ml/v1/text/generation?version=2023-05-29"

        payload: dict = {
            "model_id": model,
            "input": prompt,
            "parameters": {
                "max_new_tokens": max_tok,
                "temperature": temp,
                "top_p": top_p,
                "decoding_method": "sample",
            },
            "project_id": self._project_id,
        }
        if stop_sequences:
            payload["parameters"]["stop_sequences"] = stop_sequences

        client = await self._get_http()
        for attempt in range(3):
            try:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["results"][0]["generated_text"].strip()
            except httpx.HTTPStatusError as exc:
                if exc.response.status_code < 500 or attempt == 2:
                    raise
                logger.warning("Watsonx transient error (attempt %d): %s", attempt + 1, exc)
                import asyncio; await asyncio.sleep(2 ** attempt)

        return ""  # unreachable

    # ── Core: streaming generation (SSE) ─────────────────────────────────────

    async def stream_generate(
        self,
        prompt: str,
        model_id: str | None = None,
        max_new_tokens: int | None = None,
    ) -> AsyncGenerator[str, None]:
        """Yield text tokens from Watsonx via Server-Sent Events."""
        if not self._is_configured():
            if settings.ai_mock_when_unconfigured:
                mock = self._mock_response(prompt)
                for word in mock.split():
                    yield word + " "
                    import asyncio; await asyncio.sleep(0.02)
                return
            raise RuntimeError("IBM Watsonx is not configured.")

        token   = await self._get_iam_token()
        model   = model_id or settings.watsonx_default_model
        max_tok = max_new_tokens or settings.watsonx_max_tokens_default
        url     = f"{self._base_url}/ml/v1/text/generation_stream?version=2023-05-29"

        payload = {
            "model_id": model,
            "input": prompt,
            "parameters": {"max_new_tokens": max_tok},
            "project_id": self._project_id,
        }

        client = await self._get_http()
        async with client.stream(
            "POST",
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            },
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data:"):
                    continue
                raw = line[len("data:"):].strip()
                if not raw or raw == "[DONE]":
                    continue
                try:
                    chunk_data = json.loads(raw)
                    text = chunk_data.get("results", [{}])[0].get("generated_text", "")
                    if text:
                        yield text
                except json.JSONDecodeError:
                    pass

    # ── Image generation (stub) ───────────────────────────────────────────────

    async def imagine(self, prompt: str) -> dict:
        """
        Image generation via Granite Vision (currently a stub).
        Replace with the real Watsonx image endpoint when available.
        """
        logger.info("imagine() stub called — prompt=%r", prompt)
        return {
            "model": GRANITE_VISION_MODEL,
            "prompt": prompt,
            "image_url": None,
            "status": "stub — configure IBM Watsonx image endpoint",
        }


# ── Singleton ─────────────────────────────────────────────────────────────────

_client: GraniteClient | None = None


def get_granite_client() -> GraniteClient:
    global _client
    if _client is None:
        _client = GraniteClient()
    return _client
