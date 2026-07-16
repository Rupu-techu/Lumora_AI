"""
app/models/generated_asset.py — AI-generated asset tracking model.

Collection : generated_assets
Indexes    : owner_id + asset_type, project_id, created_at (desc)

Tracks every AI generation call result so users can:
  • browse their generation history
  • re-use / favourite past outputs
  • audit token consumption
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


# Asset type constants
ASSET_TYPE_TEXT   = "text"          # story, backstory, world section, etc.
ASSET_TYPE_IMAGE  = "image"         # Granite Vision / image generation
ASSET_TYPE_PROMPT = "prompt"        # enhanced prompt
ASSET_TYPE_STREAM = "stream"        # SSE streaming session


class GeneratedAsset(Document):
    """
    Persists one AI generation result from any domain.

    Fields
    ------
    owner           : User who triggered the generation
    project         : associated Project (optional — prompt studio has no project)
    asset_type      : text | image | prompt | stream
    domain          : source domain   (story | character | world | prompt | granite)
    title           : human-readable label  (e.g. "Act I scene draft")
    prompt          : the exact input prompt sent to the model
    result_text     : generated text output (for text assets)
    result_url      : URL for image assets or downloadable files
    model_used      : Granite model ID  (e.g. ibm/granite-13b-instruct-v2)
    finish_reason   : model stop reason  (stop | max_tokens | error)
    input_tokens    : token count for the prompt
    output_tokens   : token count for the generated output
    latency_ms      : end-to-end generation latency in milliseconds
    is_saved        : user explicitly saved / favourited this asset
    is_used         : asset was applied to a document (story, character, etc.)
    source_doc_id   : optional ID of the document that triggered generation
    generation_meta : full raw response metadata from Watsonx
    created_at      : UTC generation timestamp
    """

    owner:           Link[User]
    project:         Link[Project] | None = Field(default=None)

    asset_type:      Annotated[str, Indexed()] = Field(
        default=ASSET_TYPE_TEXT,
        pattern=r"^(text|image|prompt|stream)$",
    )
    domain:          str = Field(
        default="granite",
        pattern=r"^(story|character|world|prompt|granite|storyboard)$",
    )

    title:           str        = Field(default="Untitled Generation", max_length=300)
    prompt:          str        = Field(..., min_length=1, max_length=8192)

    result_text:     str | None = Field(default=None, max_length=200_000)
    result_url:      str | None = Field(default=None)

    model_used:      str        = Field(default="ibm/granite-13b-instruct-v2")
    finish_reason:   str | None = Field(default=None)

    # Usage / billing metadata
    input_tokens:    int | None = Field(default=None, ge=0)
    output_tokens:   int | None = Field(default=None, ge=0)
    latency_ms:      int | None = Field(default=None, ge=0)

    # User actions
    is_saved:        bool       = Field(default=False)
    is_used:         bool       = Field(default=False)
    source_doc_id:   str | None = Field(default=None)

    # Full raw Watsonx / AI provider response
    generation_meta: dict       = Field(default_factory=dict)

    created_at: Annotated[datetime, Indexed()] = Field(default_factory=_utcnow)

    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "asset_type": "text",
                "domain": "story",
                "title": "Opening chapter draft",
                "prompt": "Write an epic fantasy opening scene…",
                "model_used": "ibm/granite-13b-instruct-v2",
                "input_tokens": 128,
                "output_tokens": 512,
                "latency_ms": 3200,
                "is_saved": True,
            }
        },
    )

    class Settings:
        name             = "generated_assets"
        use_revision     = False
        validate_on_save = True
        indexes = [
            [("owner.$id", 1), ("asset_type", 1)],
            [("owner.$id", 1), ("domain", 1)],
            [("project.$id", 1)],
            [("created_at", -1)],
            [("owner.$id", 1), ("is_saved", 1)],
        ]
