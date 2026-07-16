"""
app/models/project.py — Project document model.

Collection : projects
Indexes    : owner_id + status, updated_at (desc), name text search
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed, Link
from pydantic import ConfigDict, Field

from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# Valid project statuses
PROJECT_STATUSES = ("draft", "active", "completed", "archived")


class Project(Document):
    """
    A creative project grouping stories, characters, worlds, and storyboards.

    Fields
    ------
    owner           : reference to the owning User document
    name            : project title
    description     : optional longer summary
    genre           : narrative genre (e.g. Fantasy, Sci-Fi, Horror …)
    color           : UI accent hex color  (#rrggbb)
    cover_image_url : optional hero/cover image
    status          : draft | active | completed | archived
    tags            : free-form tag list for filtering
    scene_count     : denormalised count of storyboard scenes
    character_count : denormalised count of characters
    word_count      : running total of story word counts
    is_public       : project visibility flag (future sharing feature)
    created_at      : UTC creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    owner:           Link[User]
    name:            Annotated[str, Indexed()] = Field(..., min_length=1, max_length=200)
    description:     str | None = Field(default=None, max_length=1000)
    genre:           str | None = Field(default=None, max_length=80)
    color:           str        = Field(default="#7c3aed",
                                        pattern=r"^#[0-9a-fA-F]{6}$")
    cover_image_url: str | None = Field(default=None)

    status:          str = Field(default="draft",
                                 pattern=r"^(draft|active|completed|archived)$")
    tags:            list[str] = Field(default_factory=list, max_length=20)
    is_public:       bool      = Field(default=False)

    # Denormalised counters (updated by service layer)
    scene_count:     int = Field(default=0, ge=0)
    character_count: int = Field(default=0, ge=0)
    word_count:      int = Field(default=0, ge=0)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "The Last Kingdom",
                "genre": "Fantasy",
                "color": "#7c3aed",
                "status": "active",
                "tags": ["epic", "magic", "dragons"],
            }
        }
    )

    class Settings:
        name             = "projects"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("owner.$id", 1), ("status", 1)],
            [("updated_at", -1)],
            [("name", "text"), ("description", "text")],
        ]
