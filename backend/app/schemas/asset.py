"""
app/schemas/asset.py — Asset request / response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AssetCreate(BaseModel):
    """Body for POST /assets — upload or register a new asset."""

    asset_type:      str           = Field(
        default="image",
        pattern=r"^(image|audio|document|text|other)$",
    )
    title:           str           = Field(..., min_length=1, max_length=300)
    description:     str | None    = Field(default=None, max_length=2000)
    file_url:        str           = Field(..., description="Storage URL of the asset")
    thumbnail_url:   str | None    = None
    mime_type:       str | None    = Field(default=None, max_length=100)
    file_size_bytes: int | None    = Field(default=None, ge=0)
    tags:            list[str]     = Field(default_factory=list)
    is_public:       bool          = False
    project_id:      str | None    = None
    source:          str           = Field(default="upload", pattern=r"^(upload|ai_generated|url)$")
    ai_prompt:       str | None    = Field(default=None, max_length=4000)
    # Stored as "model_used" in DB; renamed here to avoid Pydantic namespace clash
    ai_model:        str | None    = Field(default=None, alias="model_used",
                                           serialization_alias="model_used")

    model_config = {
        "json_schema_extra": {
            "example": {
                "asset_type": "image",
                "title": "Hero portrait",
                "file_url": "https://cdn.example.com/hero.png",
                "mime_type": "image/png",
                "source": "upload",
            }
        }
    }


class AssetUpdate(BaseModel):
    title:       str | None  = Field(default=None, min_length=1, max_length=300)
    description: str | None  = None
    tags:        list[str] | None = None
    is_public:   bool | None = None


class AssetOut(BaseModel):
    id:              str
    owner_id:        str
    project_id:      str | None
    asset_type:      str
    title:           str
    description:     str | None
    file_url:        str
    thumbnail_url:   str | None
    mime_type:       str | None
    file_size_bytes: int | None
    tags:            list[str]
    is_public:       bool
    source:          str
    ai_prompt:       str | None
    ai_model:        str | None    = Field(default=None, alias="model_used",
                                           serialization_alias="model_used")
    created_at:      datetime
    updated_at:      datetime
