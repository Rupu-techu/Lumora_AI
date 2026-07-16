"""
app/schemas/project.py — Project request / response schemas for Lumora AI.

Follows the naming convention requested in the task spec:
  - ``title``  is the primary project name field (maps to ``name`` in the
    Beanie model for backward compat — the service layer handles the mapping).
  - HTTP verbs: POST → 201, GET → 200, PUT → 200, DELETE → 204.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


# ── Valid status values ────────────────────────────────────────────────────────
PROJECT_STATUSES = ("draft", "active", "completed", "archived")
_STATUS_PATTERN  = r"^(draft|active|completed|archived)$"


# ── Request schemas ───────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    """Body for POST /projects — create a new project."""

    title:       str           = Field(..., min_length=1, max_length=200,
                                       description="Project name / title")
    description: str | None   = Field(default=None, max_length=1000)
    genre:       str | None   = Field(default=None, max_length=80)
    status:      str           = Field(
        default="draft",
        pattern=_STATUS_PATTERN,
        description="Initial lifecycle status",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "The Last Kingdom",
                "description": "An epic fantasy saga set in a dying world.",
                "genre": "Fantasy",
                "status": "draft",
            }
        }
    }


class ProjectUpdate(BaseModel):
    """Body for PUT /projects/{id} — full or partial project update."""

    title:       str | None  = Field(default=None, min_length=1, max_length=200)
    description: str | None  = Field(default=None, max_length=1000)
    genre:       str | None  = None
    status:      str | None  = Field(default=None, pattern=_STATUS_PATTERN)

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "The Last Kingdom — Revised",
                "status": "active",
            }
        }
    }


# ── Response schemas ──────────────────────────────────────────────────────────

class ProjectOut(BaseModel):
    """Serialised project document returned from all project endpoints."""

    id:              str
    owner_id:        str
    title:           str              # canonical name field
    description:     str | None
    genre:           str | None
    status:          str
    scene_count:     int
    character_count: int
    word_count:      int
    created_at:      datetime
    updated_at:      datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "64f1a2b3c4d5e6f7a8b9c0d1",
                "owner_id": "64f1a2b3c4d5e6f7a8b9c0d0",
                "title": "The Last Kingdom",
                "description": "An epic fantasy saga.",
                "genre": "Fantasy",
                "status": "active",
                "scene_count": 12,
                "character_count": 5,
                "word_count": 4200,
                "created_at": "2024-01-15T09:00:00Z",
                "updated_at": "2024-01-20T14:30:00Z",
            }
        }
    }


class ProjectListResponse(PaginatedResponse):
    """Paginated list of projects."""
    items: list[ProjectOut]


class ProjectStats(BaseModel):
    """Aggregated content statistics for a project."""
    story_count:     int
    character_count: int
    world_count:     int
    prompt_count:    int
    word_count:      int
