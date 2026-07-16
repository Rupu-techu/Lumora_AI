"""
app/routers/stories.py — Story CRUD + AI generation endpoints.

Routes
------
GET    /api/projects/{pid}/stories          → StoryListResponse
POST   /api/projects/{pid}/stories          → StoryOut (201)
GET    /api/projects/{pid}/stories/{id}     → StoryOut
PATCH  /api/projects/{pid}/stories/{id}     → StoryOut
DELETE /api/projects/{pid}/stories/{id}     → 204
POST   /api/stories/generate                → StoryGenerateResponse
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status

import app.db as db
from app.core.dependencies import PaginationParams, get_current_user, paginate
from app.schemas import (
    StoryCreate,
    StoryGenerateRequest,
    StoryGenerateResponse,
    StoryListResponse,
    StoryOut,
    StoryUpdate,
)
from app.services.story_service import StoryService, get_story_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["stories"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_out(s: dict) -> StoryOut:
    return StoryOut(
        id=s["id"],
        project_id=s["project_id"],
        title=s["title"],
        content=s.get("content", ""),
        genre=s.get("genre"),
        tone=s.get("tone"),
        pov=s.get("pov"),
        act=s.get("act"),
        word_count=s.get("word_count", 0),
        status=s.get("status", "draft"),
        ai_generated=s.get("ai_generated", False),
        prompt_used=s.get("prompt_used"),
        created_at=s["created_at"],
        updated_at=s["updated_at"],
    )


def _require_project(project_id: str, user_id: str) -> dict:
    project = db.get_project(project_id)
    if project is None or project["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


def _require_story(story_id: str, project_id: str) -> dict:
    story = db.get_story(story_id)
    if story is None or story["project_id"] != project_id:
        raise HTTPException(status_code=404, detail="Story not found.")
    return story


# ── CRUD endpoints ────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/stories",
    response_model=StoryListResponse,
    summary="List stories in a project",
)
async def list_stories(
    project_id: str,
    pagination: PaginationParams = Depends(paginate),
    current_user: dict = Depends(get_current_user),
    svc: StoryService  = Depends(get_story_service),
) -> StoryListResponse:
    _require_project(project_id, current_user["id"])
    items = svc.list(project_id)
    total = len(items)
    page  = items[pagination.skip : pagination.skip + pagination.limit]
    return StoryListResponse(
        items=[_to_out(s) for s in page],
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.post(
    "/projects/{project_id}/stories",
    response_model=StoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a story manually",
)
async def create_story(
    project_id: str,
    payload: StoryCreate,
    current_user: dict = Depends(get_current_user),
    svc: StoryService  = Depends(get_story_service),
) -> StoryOut:
    _require_project(project_id, current_user["id"])
    story = svc.create(
        project_id=project_id,
        owner_id=current_user["id"],
        title=payload.title,
        content=payload.content,
        genre=payload.genre,
        tone=payload.tone,
        pov=payload.pov,
        act=payload.act,
    )
    return _to_out(story)


@router.get(
    "/projects/{project_id}/stories/{story_id}",
    response_model=StoryOut,
    summary="Get a single story",
)
async def get_story(
    project_id: str,
    story_id: str,
    current_user: dict = Depends(get_current_user),
) -> StoryOut:
    _require_project(project_id, current_user["id"])
    story = _require_story(story_id, project_id)
    return _to_out(story)


@router.patch(
    "/projects/{project_id}/stories/{story_id}",
    response_model=StoryOut,
    summary="Update a story",
)
async def update_story(
    project_id: str,
    story_id: str,
    payload: StoryUpdate,
    current_user: dict = Depends(get_current_user),
    svc: StoryService  = Depends(get_story_service),
) -> StoryOut:
    _require_project(project_id, current_user["id"])
    _require_story(story_id, project_id)
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = svc.update(story_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="Story not found.")
    return _to_out(updated)


@router.delete(
    "/projects/{project_id}/stories/{story_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a story",
    response_class=Response,
)
async def delete_story(
    project_id: str,
    story_id: str,
    current_user: dict = Depends(get_current_user),
    svc: StoryService  = Depends(get_story_service),
):
    _require_project(project_id, current_user["id"])
    _require_story(story_id, project_id)
    svc.delete(story_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── AI generation endpoint ────────────────────────────────────────────────────

@router.post(
    "/stories/generate",
    response_model=StoryGenerateResponse,
    summary="Generate a story with IBM Granite AI",
)
async def generate_story(
    payload: StoryGenerateRequest,
    current_user: dict = Depends(get_current_user),
    svc: StoryService  = Depends(get_story_service),
) -> StoryGenerateResponse:
    _require_project(payload.project_id, current_user["id"])
    try:
        story_record, generated_text, model_used = await svc.generate(
            project_id=payload.project_id,
            owner_id=current_user["id"],
            prompt=payload.prompt,
            genre=payload.genre,
            tone=payload.tone,
            pov=payload.pov,
            length=payload.length,
            model=payload.model,
            save=payload.save,
        )
    except Exception as exc:
        logger.exception("Story generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))

    return StoryGenerateResponse(
        story=_to_out(story_record) if story_record else None,
        generated_text=generated_text,
        model=model_used,
        saved=story_record is not None,
    )
