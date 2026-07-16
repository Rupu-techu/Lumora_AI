"""
app/schemas/character.py — Character request / response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


class CharacterCreate(BaseModel):
    name:         str           = Field(..., min_length=1, max_length=200)
    role:         str           = Field(default="Other", max_length=80)
    age:          str | None    = Field(default=None, max_length=20)
    gender:       str | None    = None
    appearance:   str | None    = Field(default=None, max_length=2000)
    personality:  str | None    = Field(default=None, max_length=2000)
    backstory:    str | None    = Field(default=None, max_length=5000)
    motivations:  str | None    = Field(default=None, max_length=2000)
    flaws:        str | None    = Field(default=None, max_length=2000)


class CharacterUpdate(BaseModel):
    name:         str | None    = Field(default=None, min_length=1, max_length=200)
    role:         str | None    = None
    age:          str | None    = None
    gender:       str | None    = None
    appearance:   str | None    = None
    personality:  str | None    = None
    backstory:    str | None    = None
    motivations:  str | None    = None
    flaws:        str | None    = None


class CharacterGenerateRequest(BaseModel):
    """AI backstory generation for an existing character."""
    character_id: str
    style:        str | None = Field(default="detailed", pattern=r"^(brief|detailed|dramatic)$")
    model:        str | None = None


class CharacterOut(BaseModel):
    id:           str
    project_id:   str
    name:         str
    role:         str
    age:          str | None
    gender:       str | None
    appearance:   str | None
    personality:  str | None
    backstory:    str | None
    motivations:  str | None
    flaws:        str | None
    ai_generated: bool
    created_at:   datetime
    updated_at:   datetime


class CharacterListResponse(PaginatedResponse):
    items: list[CharacterOut]


class CharacterGenerateResponse(BaseModel):
    character:           CharacterOut
    generated_backstory: str
    model:               str
