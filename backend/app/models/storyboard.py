"""
app/models/storyboard.py — Storyboard and Scene document models.

Collections
-----------
  storyboards — one per project, acts as the board container
  scenes      — individual cards on the board (top-level collection for
                efficient querying; reference parent Storyboard via FK)

Indexes     : project_id, act + order, full-text on scene title/description
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


# ── Scene ─────────────────────────────────────────────────────────────────────

class Scene(Document):
    """
    A single card on a storyboard — represents one scene or beat.

    Fields
    ------
    storyboard      : parent Storyboard document
    project         : owning Project (denormalised for efficient queries)
    owner           : User who created the scene
    title           : short scene heading
    description     : longer scene summary / action description
    act             : act label  (Act I, Act II, Act III, Epilogue …)
    order           : sort position within the act (0-based)
    status          : outline | draft | written | approved | archived
    pov_character   : name / reference of POV character for this scene
    location        : where the scene takes place (free text)
    mood            : emotional tone  (tense, joyful, melancholic …)
    duration_pages  : estimated page count (optional)
    notes           : director / author notes
    tags            : free-form tags
    image_url       : optional scene concept art URL
    ai_generated    : was scene content AI-generated?
    model_used      : Granite model used
    generation_meta : raw Watsonx metadata
    created_at      : UTC creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    storyboard:     Link["Storyboard"]
    project:        Link[Project]
    owner:          Link[User]

    title:          str = Field(..., min_length=1, max_length=300)
    description:    str = Field(default="", max_length=10_000)

    act:            str = Field(default="Act I", max_length=80)
    order:          int = Field(default=0, ge=0)
    status:         str = Field(
        default="outline",
        pattern=r"^(outline|draft|written|approved|archived)$",
    )

    pov_character:  str | None = Field(default=None, max_length=200)
    location:       str | None = Field(default=None, max_length=300)
    mood:           str | None = Field(default=None, max_length=100)
    duration_pages: float | None = Field(default=None, ge=0)
    notes:          str | None = Field(default=None, max_length=5000)

    tags:           list[str] = Field(default_factory=list, max_length=20)
    image_url:      str | None = Field(default=None)

    # AI metadata
    ai_generated:    bool       = Field(default=False)
    model_used:      str | None = Field(default=None)
    generation_meta: dict       = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "title": "The Hero's Departure",
                "act": "Act I",
                "order": 3,
                "location": "Port of Astoria",
                "mood": "bittersweet",
                "status": "draft",
            }
        },
    )

    class Settings:
        name             = "scenes"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("storyboard.$id", 1), ("act", 1), ("order", 1)],
            [("project.$id", 1)],
            [("title", "text"), ("description", "text")],
            [("updated_at", -1)],
        ]


# ── Storyboard ────────────────────────────────────────────────────────────────

class Storyboard(Document):
    """
    A visual board that organises scenes for a project.

    Typically one board per project, but the model supports multiple
    (e.g. per story arc / episode).

    Fields
    ------
    project         : owning Project
    owner           : creator User
    title           : board label  (defaults to "Main Storyboard")
    description     : optional board description
    act_order       : ordered list of act labels controlling column order
    scene_count     : denormalised total scene count
    is_default      : marks the primary board for the project
    created_at      : UTC creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    project:    Link[Project]
    owner:      Link[User]

    title:      Annotated[str, Indexed()] = Field(
        default="Main Storyboard", min_length=1, max_length=200
    )
    description: str | None = Field(default=None, max_length=1000)
    act_order:  list[str]   = Field(
        default_factory=lambda: ["Act I", "Act II", "Act III", "Epilogue"],
        description="Ordered column headers for the board view",
    )
    scene_count: int  = Field(default=0, ge=0)
    is_default:  bool = Field(default=True)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Season 1 Arc",
                "is_default": True,
                "act_order": ["Act I", "Act II", "Act III", "Epilogue"],
            }
        }
    )

    class Settings:
        name             = "storyboards"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("project.$id", 1)],
            [("updated_at", -1)],
        ]
