"""
app/models/character.py — Character document model.

Collection : characters
Indexes    : project_id + role, name text search
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


# Canonical roles — open-ended (model stores any string)
CHARACTER_ROLES = (
    "Protagonist",
    "Antagonist",
    "Supporting",
    "Mentor",
    "Comic Relief",
    "Love Interest",
    "Villain",
    "Other",
)


class Character(Document):
    """
    A character entity within a project.

    Fields
    ------
    project         : owning Project
    owner           : User who created the character
    name            : character name (indexed for search)
    role            : narrative role  (Protagonist, Antagonist …)
    age             : age string  ("28", "mid-30s", "immortal" …)
    gender          : gender identity
    appearance      : physical description
    personality     : personality traits paragraph
    backstory       : origin / history paragraph
    motivations     : core drives and goals
    flaws           : weaknesses / character flaws
    relationships   : list of {name, relation} dicts
    image_url       : optional character portrait URL
    voice_notes     : speech / mannerism notes
    tags            : free-form tags (e.g. ["mage", "elf"])
    ai_generated    : backstory was AI-written
    model_used      : Granite model ID used
    generation_meta : raw Watsonx response metadata
    created_at      : UTC creation timestamp
    updated_at      : UTC last-modified timestamp
    """

    project:         Link[Project]
    owner:           Link[User]

    name:            Annotated[str, Indexed()] = Field(..., min_length=1, max_length=200)
    role:            str        = Field(default="Other", max_length=80)

    age:             str | None = Field(default=None, max_length=40)
    gender:          str | None = Field(default=None, max_length=60)

    appearance:      str | None = Field(default=None, max_length=3000)
    personality:     str | None = Field(default=None, max_length=3000)
    backstory:       str | None = Field(default=None, max_length=8000)
    motivations:     str | None = Field(default=None, max_length=2000)
    flaws:           str | None = Field(default=None, max_length=2000)
    voice_notes:     str | None = Field(default=None, max_length=1000)

    relationships:   list[dict] = Field(
        default_factory=list,
        description='[{"name": "Aria", "relation": "Mentor"}, …]',
    )
    image_url:       str | None = Field(default=None)
    tags:            list[str]  = Field(default_factory=list, max_length=30)

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
                "name": "Elara Voss",
                "role": "Protagonist",
                "age": "24",
                "gender": "Female",
                "traits": ["brave", "curious", "stubborn"],
                "ai_generated": True,
            }
        },
    )

    class Settings:
        name             = "characters"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("project.$id", 1), ("role", 1)],
            [("name", "text")],
            [("updated_at", -1)],
        ]
