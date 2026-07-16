"""
app/schemas — Pydantic request / response models for Lumora AI.

Each sub-module covers one domain:

    schemas.common      — shared helpers (PaginatedResponse, ObjectId coercion)
    schemas.auth        — registration, login, JWT tokens, user profile
    schemas.project     — project CRUD (ProjectCreate, ProjectUpdate, ProjectOut)
    schemas.story       — story CRUD + AI generation
    schemas.character   — character CRUD + AI backstory
    schemas.world       — world CRUD + AI lore generation
    schemas.asset       — asset upload / management
    schemas.prompt      — prompt library CRUD + AI enhancement
    schemas.granite     — low-level Granite / AI generation

All public symbols are re-exported from this top-level package so existing
import paths (``from app.schemas import ProjectOut``) continue to work
unchanged.
"""

from app.schemas.asset import AssetCreate, AssetOut, AssetUpdate
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    TokenResponse,
    UserOut,
    UserUpdateRequest,
)
from app.schemas.character import (
    CharacterCreate,
    CharacterGenerateRequest,
    CharacterGenerateResponse,
    CharacterListResponse,
    CharacterOut,
    CharacterUpdate,
)
from app.schemas.common import PaginatedResponse
from app.schemas.granite import (
    GraniteGenerateRequest,
    GraniteGenerateResponse,
    ImagineRequest,
    ImagineResponse,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectOut,
    ProjectStats,
    ProjectUpdate,
)
from app.schemas.prompt import (
    PromptCreate,
    PromptEnhanceRequest,
    PromptEnhanceResponse,
    PromptListResponse,
    PromptOut,
    PromptUpdate,
)
from app.schemas.story import (
    StoryCreate,
    StoryGenerateRequest,
    StoryGenerateResponse,
    StoryListResponse,
    StoryOut,
    StoryUpdate,
)
from app.schemas.world import (
    WorldCreate,
    WorldGenerateRequest,
    WorldGenerateResponse,
    WorldListResponse,
    WorldOut,
    WorldUpdate,
)

__all__ = [
    # common
    "PaginatedResponse",
    # auth
    "RegisterRequest", "LoginRequest", "TokenPair", "TokenResponse",
    "RefreshRequest", "UserOut", "UserUpdateRequest",
    # project
    "ProjectCreate", "ProjectUpdate", "ProjectOut",
    "ProjectListResponse", "ProjectStats",
    # story
    "StoryCreate", "StoryUpdate", "StoryOut",
    "StoryListResponse", "StoryGenerateRequest", "StoryGenerateResponse",
    # character
    "CharacterCreate", "CharacterUpdate", "CharacterOut",
    "CharacterListResponse", "CharacterGenerateRequest", "CharacterGenerateResponse",
    # world
    "WorldCreate", "WorldUpdate", "WorldOut",
    "WorldListResponse", "WorldGenerateRequest", "WorldGenerateResponse",
    # asset
    "AssetCreate", "AssetUpdate", "AssetOut",
    # prompt
    "PromptCreate", "PromptUpdate", "PromptOut",
    "PromptListResponse", "PromptEnhanceRequest", "PromptEnhanceResponse",
    # granite
    "GraniteGenerateRequest", "GraniteGenerateResponse",
    "ImagineRequest", "ImagineResponse",
]
