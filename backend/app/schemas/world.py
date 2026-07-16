"""
app/schemas/world.py — World request / response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import PaginatedResponse


class WorldCreate(BaseModel):
    name:              str           = Field(..., min_length=1, max_length=200)
    description:       str | None    = Field(default=None, max_length=2000)
    geography:         str | None    = Field(default=None, max_length=5000)
    cultures:          str | None    = Field(default=None, max_length=5000)
    history:           str | None    = Field(default=None, max_length=5000)
    magic_system:      str | None    = Field(default=None, max_length=3000)
    technology_level:  str | None    = Field(default=None, max_length=500)
    notable_locations: list[str]     = Field(default_factory=list, max_length=50)


class WorldUpdate(BaseModel):
    name:              str | None          = Field(default=None, min_length=1, max_length=200)
    description:       str | None          = None
    geography:         str | None          = None
    cultures:          str | None          = None
    history:           str | None          = None
    magic_system:      str | None          = None
    technology_level:  str | None          = None
    notable_locations: list[str] | None    = None


class WorldGenerateRequest(BaseModel):
    project_id: str
    concept:    str = Field(
        ..., min_length=5, max_length=1000,
        description="A short concept for the world",
    )
    sections: list[str] = Field(
        default=["geography", "cultures", "history"],
        description="Which world sections to generate",
    )
    model: str | None = None

    @field_validator("sections")
    @classmethod
    def _validate_sections(cls, v: list[str]) -> list[str]:
        allowed = {"geography", "cultures", "history", "magic_system", "technology_level"}
        bad = set(v) - allowed
        if bad:
            raise ValueError(f"Unknown sections: {bad}. Allowed: {allowed}")
        return v


class WorldOut(BaseModel):
    id:                str
    project_id:        str
    name:              str
    description:       str | None
    geography:         str | None
    cultures:          str | None
    history:           str | None
    magic_system:      str | None
    technology_level:  str | None
    notable_locations: list[str]
    ai_generated:      bool
    created_at:        datetime
    updated_at:        datetime


class WorldListResponse(PaginatedResponse):
    items: list[WorldOut]


class WorldGenerateResponse(BaseModel):
    world:              WorldOut
    generated_sections: dict[str, str]
    model:              str
