"""
app/models/asset.py — Asset document model for Lumora AI.

Collection : assets
Indexes    : owner_id + asset_type, project_id, created_at (desc)

Tracks user-uploaded or AI-generated digital assets (images, audio,
documents, etc.) so they can be browsed, re-used, and linked to projects.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed, Link
from pydantic import ConfigDict, Field

from app.models.project import Project
from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Asset type constants ───────────────────────────────────────────────────────
ASSET_TYPE_IMAGE    = "image"
ASSET_TYPE_AUDIO    = "audio"
ASSET_TYPE_DOCUMENT = "document"
ASSET_TYPE_TEXT     = "text"
ASSET_TYPE_OTHER    = "other"

ASSET_TYPES = frozenset(
    {ASSET_TYPE_IMAGE, ASSET_TYPE_AUDIO, ASSET_TYPE_DOCUMENT, ASSET_TYPE_TEXT, ASSET_TYPE_OTHER}
)


class Asset(Document):
    """
    A digital asset belonging to a user and optionally scoped to a project.

    Fields
    ------
    owner           : User who owns this asset
    project         : optional project association
    asset_type      : image | audio | document | text | other
    title           : human-readable filename or label
    description     : optional longer description
    file_url        : storage URL (S3, GCS, or CDN link)
    thumbnail_url   : optional lower-resolution preview URL
    mime_type       : MIME type string  (e.g. "image/png")
    file_size_bytes : raw file size in bytes
    tags            : free-form tag list
    is_public       : whether the asset can be accessed without auth
    source          : origin of the asset  (upload | ai_generated | url)
    ai_prompt       : prompt used when source == "ai_generated"
    model_used      : AI model that generated the asset (if applicable)
    metadata        : arbitrary key-value metadata (width, height, duration…)
    created_at      : UTC upload / creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    owner:              Link[User]
    project:            Link[Project] | None = Field(default=None)

    asset_type:         Annotated[str, Indexed()] = Field(
        default=ASSET_TYPE_IMAGE,
        pattern=r"^(image|audio|document|text|other)$",
    )
    title:              str        = Field(..., min_length=1, max_length=300)
    description:        str | None = Field(default=None, max_length=2000)

    file_url:           str        = Field(..., description="Primary storage URL")
    thumbnail_url:      str | None = Field(default=None)
    mime_type:          str | None = Field(default=None, max_length=100)
    file_size_bytes:    int | None = Field(default=None, ge=0)

    tags:               list[str]  = Field(default_factory=list, max_length=30)
    is_public:          bool       = Field(default=False)

    # Provenance
    source:             str        = Field(
        default="upload",
        pattern=r"^(upload|ai_generated|url)$",
    )
    ai_prompt:          str | None = Field(default=None, max_length=4000)
    model_used:         str | None = Field(default=None)

    # Arbitrary extra metadata (dimensions, duration, etc.)
    metadata:           dict       = Field(default_factory=dict)

    created_at: Annotated[datetime, Indexed()] = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "asset_type": "image",
                "title": "Hero portrait — Elara Voss",
                "file_url": "https://cdn.example.com/assets/elara.png",
                "mime_type": "image/png",
                "file_size_bytes": 204800,
                "source": "ai_generated",
                "tags": ["character", "portrait"],
            }
        },
    )

    class Settings:
        name             = "assets"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("owner.$id", 1), ("asset_type", 1)],
            [("project.$id", 1)],
            [("created_at", -1)],
            [("owner.$id", 1), ("is_public", 1)],
            [("title", "text"), ("description", "text")],
        ]
