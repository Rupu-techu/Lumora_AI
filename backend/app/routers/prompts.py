"""
app/routers/prompts.py — Prompt CRUD + AI enhancement endpoints.

Routes
------
GET    /api/prompts              → PromptListResponse
POST   /api/prompts              → PromptOut (201)
GET    /api/prompts/{id}         → PromptOut
PATCH  /api/prompts/{id}         → PromptOut
DELETE /api/prompts/{id}         → 204
POST   /api/prompts/{id}/use     → 204  (increment use counter)
POST   /api/prompts/enhance      → PromptEnhanceResponse
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

import app.db as db
from app.core.dependencies import PaginationParams, get_current_user, paginate
from app.schemas import (
    PromptCreate,
    PromptEnhanceRequest,
    PromptEnhanceResponse,
    PromptListResponse,
    PromptOut,
    PromptUpdate,
)
from app.services.prompt_service import PromptService, get_prompt_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prompts", tags=["prompts"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_out(p: dict) -> PromptOut:
    return PromptOut(
        id=p["id"],
        owner_id=p["owner_id"],
        project_id=p.get("project_id"),
        title=p["title"],
        content=p["content"],
        category=p.get("category", "General"),
        model=p.get("model"),
        is_favourite=p.get("is_favourite", False),
        use_count=p.get("use_count", 0),
        created_at=p["created_at"],
        updated_at=p["updated_at"],
    )


def _require_prompt(prompt_id: str, user_id: str) -> dict:
    prompt = db.get_prompt(prompt_id)
    if prompt is None or prompt["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="Prompt not found.")
    return prompt


# ── CRUD endpoints ────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=PromptListResponse,
    summary="List all prompts owned by the current user",
)
async def list_prompts(
    category: str | None        = Query(default=None, max_length=80),
    favourites_only: bool       = Query(default=False),
    pagination: PaginationParams = Depends(paginate),
    current_user: dict           = Depends(get_current_user),
    svc: PromptService           = Depends(get_prompt_service),
) -> PromptListResponse:
    items = svc.list(current_user["id"])
    if category:
        items = [p for p in items if p.get("category", "").lower() == category.lower()]
    if favourites_only:
        items = [p for p in items if p.get("is_favourite")]
    total = len(items)
    page  = items[pagination.skip : pagination.skip + pagination.limit]
    return PromptListResponse(
        items=[_to_out(p) for p in page],
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.post(
    "",
    response_model=PromptOut,
    status_code=status.HTTP_201_CREATED,
    summary="Save a new prompt",
)
async def create_prompt(
    payload: PromptCreate,
    current_user: dict = Depends(get_current_user),
    svc: PromptService = Depends(get_prompt_service),
) -> PromptOut:
    prompt = svc.create(
        owner_id=current_user["id"],
        title=payload.title,
        content=payload.content,
        category=payload.category,
        model=payload.model,
        project_id=payload.project_id,
        is_favourite=payload.is_favourite,
    )
    return _to_out(prompt)


@router.get("/{prompt_id}", response_model=PromptOut, summary="Get a single prompt")
async def get_prompt(
    prompt_id: str,
    current_user: dict = Depends(get_current_user),
) -> PromptOut:
    prompt = _require_prompt(prompt_id, current_user["id"])
    return _to_out(prompt)


@router.patch("/{prompt_id}", response_model=PromptOut, summary="Update a prompt")
async def update_prompt(
    prompt_id: str,
    payload: PromptUpdate,
    current_user: dict = Depends(get_current_user),
    svc: PromptService = Depends(get_prompt_service),
) -> PromptOut:
    _require_prompt(prompt_id, current_user["id"])
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = svc.update(prompt_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="Prompt not found.")
    return _to_out(updated)


@router.delete(
    "/{prompt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a prompt",
    response_class=Response,
)
async def delete_prompt(
    prompt_id: str,
    current_user: dict = Depends(get_current_user),
    svc: PromptService = Depends(get_prompt_service),
):
    _require_prompt(prompt_id, current_user["id"])
    svc.delete(prompt_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{prompt_id}/use",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Record a prompt use (increments use counter)",
    response_class=Response,
)
async def record_use(
    prompt_id: str,
    current_user: dict = Depends(get_current_user),
    svc: PromptService = Depends(get_prompt_service),
):
    _require_prompt(prompt_id, current_user["id"])
    svc.record_use(prompt_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── AI enhancement endpoint ───────────────────────────────────────────────────

@router.post(
    "/enhance",
    response_model=PromptEnhanceResponse,
    summary="Enhance a prompt with IBM Granite AI",
)
async def enhance_prompt(
    payload: PromptEnhanceRequest,
    current_user: dict = Depends(get_current_user),
    svc: PromptService = Depends(get_prompt_service),
) -> PromptEnhanceResponse:
    # Validate ownership if a prompt_id was supplied
    if payload.prompt_id:
        _require_prompt(payload.prompt_id, current_user["id"])

    try:
        saved_prompt, original, enhanced, model_used = await svc.enhance(
            owner_id=current_user["id"],
            prompt_id=payload.prompt_id,
            content=payload.content,
            style=payload.style,
            model=payload.model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Prompt enhancement failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))

    return PromptEnhanceResponse(
        original=original,
        enhanced=enhanced,
        model=model_used,
        prompt=_to_out(saved_prompt) if saved_prompt else None,
    )
