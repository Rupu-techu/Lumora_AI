"""
app/schemas/granite.py — Low-level Granite / AI generation schemas.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class GraniteGenerateRequest(BaseModel):
    prompt:         str        = Field(..., min_length=1, max_length=8192)
    model:          str | None = Field(default=None, description="Watsonx model ID.")
    max_new_tokens: int        = Field(default=512, ge=1, le=4096)
    temperature:    float      = Field(default=0.7, ge=0.0, le=2.0)
    top_p:          float      = Field(default=0.9, ge=0.0, le=1.0)
    stream:         bool       = Field(default=False)


class GraniteGenerateResponse(BaseModel):
    generated_text: str
    model:          str
    finish_reason:  str | None        = None
    usage:          dict[str, Any] | None = None


class ImagineRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)


class ImagineResponse(BaseModel):
    model:     str
    prompt:    str
    image_url: str | None
    status:    str
    metadata:  dict[str, Any] = {}
