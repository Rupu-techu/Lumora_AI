"""
app/models/user.py — User document model.

Collection : users
Indexes    : email (unique), created_at
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed
from pydantic import ConfigDict, EmailStr, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Document):
    """
    Represents a registered user of Lumora AI.

    Fields
    ------
    name            : display name
    email           : unique login identifier
    hashed_password : bcrypt hash — never exposed via API
    bio             : optional short bio
    avatar_url      : profile picture URL
    plan            : subscription tier  (free | pro | enterprise)
    is_active       : soft-disable account without deletion
    is_verified     : email verification flag
    created_at      : account creation timestamp (UTC)
    updated_at      : last mutation timestamp (UTC)
    """

    name:             str       = Field(..., min_length=1, max_length=100)
    email:            Annotated[str, Indexed(unique=True)] = Field(...)
    hashed_password:  str       = Field(...)

    bio:              str | None       = Field(default=None, max_length=500)
    avatar_url:       str | None       = Field(default=None)
    plan:             str              = Field(default="free")   # free | pro | enterprise
    is_active:        bool             = Field(default=True)
    is_verified:      bool             = Field(default=False)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Ada Lovelace",
                "email": "ada@example.com",
                "hashed_password": "$2b$12$...",
                "plan": "pro",
                "is_active": True,
            }
        }
    )

    class Settings:
        name            = "users"
        use_revision    = False
        validate_on_save = True
        indexes = [
            [("email", 1)],
            [("created_at", -1)],
        ]
