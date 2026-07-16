"""
app/models/world.py — World-building document model.

Collection : worlds
Indexes    : project_id, name text search
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from beanie import Document, Indexed, Link
from pydantic import BaseModel, ConfigDict, Field

from app.models.project import Project
from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Location(BaseModel):
    """
    Embedded sub-document for a notable location within a World.
    Stored as a plain dict inside the World document's notable_locations list.
    """

    name:         str        = Field(..., min_length=1, max_length=200)
    description:  str | None = Field(default=None, max_length=2000)
    region:       str | None = Field(default=None, max_length=200)
    significance: str | None = Field(default=None, max_length=1000)


class World(Document):
    """
    A world-building asset — the lore, geography, and rules of a setting.

    Fields
    ------
    project            : owning Project
    owner              : creating User
    name               : world name
    description        : high-level overview
    genre              : world genre  (Fantasy, Sci-Fi, Post-Apocalyptic …)
    climate            : dominant climate / atmosphere
    geography          : geography description (continents, oceans, biomes)
    cultures           : peoples, customs, social structures
    history            : timeline of major historical events
    magic_system       : rules and lore for magic (if any)
    technology_level   : tech era (Medieval, Steam-punk, Space-faring …)
    economy            : trade, currency, resources
    factions           : organisations, nations, guilds
    notable_locations  : list of embedded Location objects
    lore_notes         : free-form additional notes
    ai_generated       : was content AI-generated?
    generated_sections : which sections were AI-filled
    model_used         : Granite model ID
    generation_meta    : raw Watsonx response metadata
    created_at         : UTC creation timestamp
    updated_at         : UTC last-modified timestamp
    """

    project:            Link[Project]
    owner:              Link[User]

    name:               Annotated[str, Indexed()] = Field(..., min_length=1, max_length=200)
    description:        str | None = Field(default=None, max_length=3000)
    genre:              str | None = Field(default=None, max_length=80)
    climate:            str | None = Field(default=None, max_length=300)

    geography:          str | None = Field(default=None, max_length=6000)
    cultures:           str | None = Field(default=None, max_length=6000)
    history:            str | None = Field(default=None, max_length=6000)
    magic_system:       str | None = Field(default=None, max_length=4000)
    technology_level:   str | None = Field(default=None, max_length=500)
    economy:            str | None = Field(default=None, max_length=4000)
    factions:           str | None = Field(default=None, max_length=4000)
    lore_notes:         str | None = Field(default=None, max_length=6000)

    notable_locations:  list[dict] = Field(
        default_factory=list,
        description='[{"name": "…", "description": "…", "region": "…"}, …]',
    )

    # AI metadata
    ai_generated:       bool       = Field(default=False)
    generated_sections: list[str]  = Field(default_factory=list)
    model_used:         str | None = Field(default=None)
    generation_meta:    dict       = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "name": "Aethermoor",
                "genre": "Fantasy",
                "climate": "Temperate with arcane storms",
                "technology_level": "Medieval",
                "ai_generated": True,
            }
        },
    )

    class Settings:
        name             = "worlds"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("project.$id", 1)],
            [("name", "text"), ("description", "text")],
            [("updated_at", -1)],
        ]
