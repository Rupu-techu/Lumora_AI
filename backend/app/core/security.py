"""
app/core/security.py — JWT helpers + password hashing.

Supports:
  - Access tokens  (short-lived, HS256)
  - Refresh tokens (long-lived, persisted in a simple in-memory blacklist)
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

logger   = logging.getLogger(__name__)
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Minimal in-memory refresh-token blacklist (swap for Redis in production)
_revoked_refresh_tokens: set[str] = set()


# ── Password ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Token creation ────────────────────────────────────────────────────────────

def _make_token(
    subject: str,
    token_type: Literal["access", "refresh"],
    expires_delta: timedelta,
) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str) -> str:
    return _make_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
    )


def create_refresh_token(user_id: str) -> str:
    return _make_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=settings.jwt_refresh_expire_days),
    )


# ── Token decoding ────────────────────────────────────────────────────────────

def decode_token(token: str, expected_type: str = "access") -> str:
    """
    Decode a JWT and return the ``sub`` (user_id) claim.

    Raises ``JWTError`` when:
    - signature is invalid
    - token is expired
    - ``type`` claim doesn't match ``expected_type``
    - token has been revoked (refresh tokens only)
    """
    payload = jwt.decode(
        token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
    )

    token_type: str | None = payload.get("type")
    if token_type != expected_type:
        raise JWTError(f"Expected token type '{expected_type}', got '{token_type}'.")

    if expected_type == "refresh" and token in _revoked_refresh_tokens:
        raise JWTError("Refresh token has been revoked.")

    sub: str | None = payload.get("sub")
    if not sub:
        raise JWTError("Token missing 'sub' claim.")

    return sub


def revoke_refresh_token(token: str) -> None:
    """Add a refresh token to the in-memory blacklist."""
    _revoked_refresh_tokens.add(token)
