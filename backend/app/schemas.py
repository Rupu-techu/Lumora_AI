"""
app/schemas.py — All Pydantic request / response models.

Organised by domain. Every domain follows the same pattern:
    <Domain>Create    – POST body
    <Domain>Update    – PATCH body (all fields Optional)
    <Domain>Out       – response shape
    <Domain>ListResponse – paginated list wrapper
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Shared helpers ─────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    skip: int
    limit: int


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    name: str  = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenResponse(BaseModel):
    """Single access token (kept for backward compatibility)."""
    access_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    bio: str | None
    avatar_url: str | None
    created_at: datetime


class UserUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    bio:  str | None = Field(default=None, max_length=500)


# ═══════════════════════════════════════════════════════════════════════════════
# PROJECTS
# ═══════════════════════════════════════════════════════════════════════════════

class ProjectCreate(BaseModel):
    name: str         = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    genre: str | None = Field(default=None, max_length=80)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class ProjectUpdate(BaseModel):
    name: str | None        = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    genre: str | None       = None
    color: str | None       = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    status: str | None      = Field(default=None, pattern=r"^(draft|active|completed|archived)$")


class ProjectOut(BaseModel):
    id: str
    owner_id: str
    name: str
    description: str | None
    genre: str | None
    color: str
    status: str
    scene_count: int
    character_count: int
    word_count: int
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(PaginatedResponse):
    items: list[ProjectOut]


class ProjectStats(BaseModel):
    story_count: int
    character_count: int
    world_count: int
    prompt_count: int
    word_count: int


# ═══════════════════════════════════════════════════════════════════════════════
# STORIES
# ═══════════════════════════════════════════════════════════════════════════════

class StoryCreate(BaseModel):
    title: str   = Field(..., min_length=1, max_length=300)
    content: str = Field(default="", max_length=200_000)
    genre: str | None = None
    tone:  str | None = None
    pov:   str | None = None
    act:   str | None = None


class StoryUpdate(BaseModel):
    title: str | None   = Field(default=None, min_length=1, max_length=300)
    content: str | None = Field(default=None, max_length=200_000)
    genre: str | None   = None
    tone:  str | None   = None
    pov:   str | None   = None
    act:   str | None   = None
    status: str | None  = Field(default=None, pattern=r"^(draft|written|approved|archived)$")


class StoryGenerateRequest(BaseModel):
    """AI generation request for a story."""
    project_id: str
    prompt: str      = Field(..., min_length=5,  max_length=2000)
    genre: str | None = None
    tone:  str | None = None
    pov:   str | None = None
    length: str       = Field(default="medium", pattern=r"^(short|medium|long|epic)$")
    model: str | None = None
    save: bool        = Field(default=True, description="Persist the result as a Story record")


class StoryOut(BaseModel):
    id: str
    project_id: str
    title: str
    content: str
    genre: str | None
    tone: str | None
    pov: str | None
    act: str | None
    word_count: int
    status: str
    ai_generated: bool
    prompt_used: str | None
    created_at: datetime
    updated_at: datetime


class StoryListResponse(PaginatedResponse):
    items: list[StoryOut]


class StoryGenerateResponse(BaseModel):
    story: StoryOut | None
    generated_text: str
    model: str
    saved: bool


# ═══════════════════════════════════════════════════════════════════════════════
# CHARACTERS
# ═══════════════════════════════════════════════════════════════════════════════

class CharacterCreate(BaseModel):
    name: str        = Field(..., min_length=1, max_length=200)
    role: str        = Field(default="Other", max_length=80)
    age: str | None  = Field(default=None, max_length=20)
    gender: str | None = None
    appearance: str | None   = Field(default=None, max_length=2000)
    personality: str | None  = Field(default=None, max_length=2000)
    backstory: str | None    = Field(default=None, max_length=5000)
    motivations: str | None  = Field(default=None, max_length=2000)
    flaws: str | None        = Field(default=None, max_length=2000)


class CharacterUpdate(BaseModel):
    name: str | None       = Field(default=None, min_length=1, max_length=200)
    role: str | None       = None
    age: str | None        = None
    gender: str | None     = None
    appearance: str | None  = None
    personality: str | None = None
    backstory: str | None   = None
    motivations: str | None = None
    flaws: str | None       = None


class CharacterGenerateRequest(BaseModel):
    """AI backstory generation for an existing character."""
    character_id: str
    style: str | None = Field(default="detailed", pattern=r"^(brief|detailed|dramatic)$")
    model: str | None = None


class CharacterOut(BaseModel):
    id: str
    project_id: str
    name: str
    role: str
    age: str | None
    gender: str | None
    appearance: str | None
    personality: str | None
    backstory: str | None
    motivations: str | None
    flaws: str | None
    ai_generated: bool
    created_at: datetime
    updated_at: datetime


class CharacterListResponse(PaginatedResponse):
    items: list[CharacterOut]


class CharacterGenerateResponse(BaseModel):
    character: CharacterOut
    generated_backstory: str
    model: str


# ═══════════════════════════════════════════════════════════════════════════════
# WORLDS
# ═══════════════════════════════════════════════════════════════════════════════

class WorldCreate(BaseModel):
    name: str        = Field(..., min_length=1, max_length=200)
    description: str | None      = Field(default=None, max_length=2000)
    geography: str | None        = Field(default=None, max_length=5000)
    cultures: str | None         = Field(default=None, max_length=5000)
    history: str | None          = Field(default=None, max_length=5000)
    magic_system: str | None     = Field(default=None, max_length=3000)
    technology_level: str | None = Field(default=None, max_length=500)
    notable_locations: list[str] = Field(default_factory=list, max_length=50)


class WorldUpdate(BaseModel):
    name: str | None              = Field(default=None, min_length=1, max_length=200)
    description: str | None      = None
    geography: str | None        = None
    cultures: str | None         = None
    history: str | None          = None
    magic_system: str | None     = None
    technology_level: str | None = None
    notable_locations: list[str] | None = None


class WorldGenerateRequest(BaseModel):
    project_id: str
    concept: str    = Field(..., min_length=5, max_length=1000,
                             description="A short concept for the world (e.g. 'post-apocalyptic desert with sand-sailing ships')")
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
    id: str
    project_id: str
    name: str
    description: str | None
    geography: str | None
    cultures: str | None
    history: str | None
    magic_system: str | None
    technology_level: str | None
    notable_locations: list[str]
    ai_generated: bool
    created_at: datetime
    updated_at: datetime


class WorldListResponse(PaginatedResponse):
    items: list[WorldOut]


class WorldGenerateResponse(BaseModel):
    world: WorldOut
    generated_sections: dict[str, str]
    model: str


# ═══════════════════════════════════════════════════════════════════════════════
# PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

class PromptCreate(BaseModel):
    title: str    = Field(..., min_length=1, max_length=200)
    content: str  = Field(..., min_length=1, max_length=4000)
    category: str = Field(default="General", max_length=80)
    model: str | None   = None
    project_id: str | None = None
    is_favourite: bool  = False


class PromptUpdate(BaseModel):
    title: str | None    = Field(default=None, min_length=1, max_length=200)
    content: str | None  = Field(default=None, min_length=1, max_length=4000)
    category: str | None = None
    model: str | None    = None
    is_favourite: bool | None = None


class PromptEnhanceRequest(BaseModel):
    """AI-powered prompt enhancement."""
    prompt_id: str | None = Field(default=None, description="Enhance an existing saved prompt")
    content: str | None   = Field(default=None, min_length=5, max_length=4000,
                                   description="Or provide ad-hoc text to enhance")
    style: str            = Field(default="detailed",
                                  pattern=r"^(concise|detailed|creative|technical)$")
    model: str | None     = None


class PromptOut(BaseModel):
    id: str
    owner_id: str
    project_id: str | None
    title: str
    content: str
    category: str
    model: str | None
    is_favourite: bool
    use_count: int
    created_at: datetime
    updated_at: datetime


class PromptListResponse(PaginatedResponse):
    items: list[PromptOut]


class PromptEnhanceResponse(BaseModel):
    original: str
    enhanced: str
    model: str
    prompt: PromptOut | None


# ═══════════════════════════════════════════════════════════════════════════════
# GRANITE / AI  (low-level, direct generation)
# ═══════════════════════════════════════════════════════════════════════════════

class GraniteGenerateRequest(BaseModel):
    prompt: str       = Field(..., min_length=1, max_length=8192)
    model: str | None = Field(default=None, description="Watsonx model ID. Defaults to granite-13b.")
    max_new_tokens: int    = Field(default=512,  ge=1, le=4096)
    temperature: float     = Field(default=0.7,  ge=0.0, le=2.0)
    top_p: float           = Field(default=0.9,  ge=0.0, le=1.0)
    stream: bool           = Field(default=False)


class GraniteGenerateResponse(BaseModel):
    generated_text: str
    model: str
    finish_reason: str | None = None
    usage: dict[str, Any] | None = None


class ImagineRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)


class ImagineResponse(BaseModel):
    model: str
    prompt: str
    image_url: str | None
    status: str
    metadata: dict[str, Any] = {}
