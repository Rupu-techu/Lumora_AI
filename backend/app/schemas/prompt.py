"""
app/schemas/prompt.py — Prompt library request / response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


class PromptCreate(BaseModel):
    title:        str           = Field(..., min_length=1, max_length=200)
    content:      str           = Field(..., min_length=1, max_length=4000)
    category:     str           = Field(default="General", max_length=80)
    model:        str | None    = None
    project_id:   str | None    = None
    is_favourite: bool          = False


class PromptUpdate(BaseModel):
    title:        str | None    = Field(default=None, min_length=1, max_length=200)
    content:      str | None    = Field(default=None, min_length=1, max_length=4000)
    category:     str | None    = None
    model:        str | None    = None
    is_favourite: bool | None   = None


class PromptEnhanceRequest(BaseModel):
    """AI-powered prompt enhancement."""
    prompt_id: str | None = Field(default=None, description="Enhance an existing saved prompt")
    content:   str | None = Field(default=None, min_length=5, max_length=4000,
                                   description="Or provide ad-hoc text to enhance")
    style:     str        = Field(default="detailed",
                                  pattern=r"^(concise|detailed|creative|technical)$")
    model:     str | None = None


class PromptOut(BaseModel):
    id:           str
    owner_id:     str
    project_id:   str | None
    title:        str
    content:      str
    category:     str
    model:        str | None
    is_favourite: bool
    use_count:    int
    created_at:   datetime
    updated_at:   datetime


class PromptListResponse(PaginatedResponse):
    items: list[PromptOut]


class PromptEnhanceResponse(BaseModel):
    original: str
    enhanced: str
    model:    str
    prompt:   PromptOut | None
