"""
app/schemas/common.py — Shared Pydantic primitives reused across all domains.
"""

from __future__ import annotations

from pydantic import BaseModel


class PaginatedResponse(BaseModel):
    """Base class for all paginated list responses."""

    total: int
    skip:  int
    limit: int
