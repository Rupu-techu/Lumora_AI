"""
app/core/dependencies.py — Reusable FastAPI dependency functions.

Import these in any router:
    from app.core.dependencies import CurrentUser, PaginationParams
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import get_settings
from app.core.security import decode_token
import app.db as db

settings = get_settings()

# ── OAuth2 scheme ─────────────────────────────────────────────────────────────

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Auth dependency ───────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Resolve a Bearer token → user dict. Raises 401 on any failure."""
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_id = decode_token(token, expected_type="access")
    except Exception:
        raise exc

    user = db.get_user_by_id(user_id)
    if user is None or not user.get("is_active", True):
        raise exc
    return user


# Alias for type-annotated dependencies in route signatures
CurrentUser = Depends(get_current_user)


# ── Ownership guard ───────────────────────────────────────────────────────────

def require_project_owner(
    project_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Return the project dict if it exists and belongs to the current user,
    otherwise raise 404 (to avoid leaking existence to unauthorised callers).
    """
    project = db.get_project(project_id)
    if project is None or project["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project


# ── Pagination ────────────────────────────────────────────────────────────────

@dataclass
class PaginationParams:
    skip: int
    limit: int


def paginate(
    skip: int  = Query(default=0,   ge=0,   description="Number of records to skip"),
    limit: int = Query(default=settings.default_page_size, ge=1, le=settings.max_page_size,
                       description="Maximum number of records to return"),
) -> PaginationParams:
    return PaginationParams(skip=skip, limit=limit)
