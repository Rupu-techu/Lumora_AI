"""
app/schemas/story.py — Story request / response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


class StoryCreate(BaseModel):
    title:   str           = Field(..., min_length=1, max_length=300)
    content: str           = Field(default="", max_length=200_000)
    genre:   str | None    = None
    tone:    str | None    = None
    pov:     str | None    = None
    act:     str | None    = None


class StoryUpdate(BaseModel):
    title:   str | None    = Field(default=None, min_length=1, max_length=300)
    content: str | None    = Field(default=None, max_length=200_000)
    genre:   str | None    = None
    tone:    str | None    = None
    pov:     str | None    = None
    act:     str | None    = None
    status:  str | None    = Field(default=None, pattern=r"^(draft|written|approved|archived)$")


class StoryGenerateRequest(BaseModel):
    """AI generation request for a story."""
    project_id: str
    prompt:     str      = Field(..., min_length=5,  max_length=2000)
    genre:      str | None = None
    tone:       str | None = None
    pov:        str | None = None
    length:     str        = Field(default="medium", pattern=r"^(short|medium|long|epic)$")
    model:      str | None = None
    save:       bool       = Field(default=True, description="Persist the result as a Story record")


class StoryOut(BaseModel):
    id:           str
    project_id:   str
    title:        str
    content:      str
    genre:        str | None
    tone:         str | None
    pov:          str | None
    act:          str | None
    word_count:   int
    status:       str
    ai_generated: bool
    prompt_used:  str | None
    created_at:   datetime
    updated_at:   datetime


class StoryListResponse(PaginatedResponse):
    items: list[StoryOut]


class StoryGenerateResponse(BaseModel):
    story:          StoryOut | None
    generated_text: str
    model:          str
    saved:          bool
