"""
app/models/story.py — Story document model.

Collection : stories
Indexes    : project_id + status, updated_at (desc), full-text on title/content
"""

from __future__ import annotations

from datetime import datetime, timezone

from beanie import Document, Link
from pydantic import ConfigDict, Field

from app.models.project import Project
from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Story(Document):
    """
    A narrative text asset within a project.

    Fields
    ------
    project         : owning Project
    owner           : author / User who created this story
    title           : story title
    content         : full text body (Markdown supported)
    genre           : narrative genre override (inherits from project if None)
    tone            : narrative tone  (e.g. dark, comedic, epic …)
    pov             : point of view   (first-person, third-limited …)
    act             : story structure act label (Act I, Act II, Epilogue …)
    word_count      : auto-calculated from content length
    status          : draft | written | approved | archived
    ai_generated    : was the content produced by the AI?
    prompt_used     : the original prompt text that triggered generation
    model_used      : Granite model ID used for generation
    generation_meta : raw metadata returned by Watsonx (tokens, latency …)
    created_at      : UTC creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    project:         Link[Project]
    owner:           Link[User]

    title:           str = Field(..., min_length=1, max_length=300)
    content:         str = Field(default="", max_length=200_000)

    genre:           str | None = Field(default=None, max_length=80)
    tone:            str | None = Field(default=None, max_length=80)
    pov:             str | None = Field(default=None, max_length=80)
    act:             str | None = Field(default=None, max_length=80)

    word_count:      int = Field(default=0, ge=0)
    status:          str = Field(
        default="draft",
        pattern=r"^(draft|written|approved|archived)$",
    )

    # AI metadata
    ai_generated:    bool             = Field(default=False)
    prompt_used:     str | None       = Field(default=None, max_length=4000)
    model_used:      str | None       = Field(default=None)
    generation_meta: dict             = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "title": "The Fallen Tower",
                "genre": "Fantasy",
                "tone": "dark",
                "pov": "third-limited",
                "act": "Act I",
                "ai_generated": True,
            }
        },
    )

    class Settings:
        name             = "stories"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("project.$id", 1), ("status", 1)],
            [("updated_at", -1)],
            [("title", "text"), ("content", "text")],
        ]
