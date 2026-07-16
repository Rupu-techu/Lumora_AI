"""
app/routers/characters.py — Character CRUD + AI backstory endpoints.

Routes
------
GET    /api/projects/{pid}/characters           → CharacterListResponse
POST   /api/projects/{pid}/characters           → CharacterOut (201)
GET    /api/projects/{pid}/characters/{id}      → CharacterOut
PATCH  /api/projects/{pid}/characters/{id}      → CharacterOut
DELETE /api/projects/{pid}/characters/{id}      → 204
POST   /api/characters/{id}/generate-backstory  → CharacterGenerateResponse
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status

import app.db as db
from app.core.dependencies import PaginationParams, get_current_user, paginate
from app.schemas import (
    CharacterCreate,
    CharacterGenerateRequest,
    CharacterGenerateResponse,
    CharacterListResponse,
    CharacterOut,
    CharacterUpdate,
)
from app.services.character_service import CharacterService, get_character_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["characters"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_out(c: dict) -> CharacterOut:
    return CharacterOut(
        id=c["id"],
        project_id=c["project_id"],
        name=c["name"],
        role=c.get("role", "Other"),
        age=c.get("age"),
        gender=c.get("gender"),
        appearance=c.get("appearance"),
        personality=c.get("personality"),
        backstory=c.get("backstory"),
        motivations=c.get("motivations"),
        flaws=c.get("flaws"),
        ai_generated=c.get("ai_generated", False),
        created_at=c["created_at"],
        updated_at=c["updated_at"],
    )


def _require_project(project_id: str, user_id: str) -> None:
    project = db.get_project(project_id)
    if project is None or project["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="Project not found.")


def _require_character(character_id: str, project_id: str) -> dict:
    char = db.get_character(character_id)
    if char is None or char["project_id"] != project_id:
        raise HTTPException(status_code=404, detail="Character not found.")
    return char


def _require_character_by_owner(character_id: str, user_id: str) -> dict:
    """Used when project_id is not in the path (e.g. generate-backstory)."""
    char = db.get_character(character_id)
    if char is None or char["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="Character not found.")
    return char


# ── CRUD endpoints ────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/characters",
    response_model=CharacterListResponse,
    summary="List characters in a project",
)
async def list_characters(
    project_id: str,
    pagination: PaginationParams    = Depends(paginate),
    current_user: dict              = Depends(get_current_user),
    svc: CharacterService           = Depends(get_character_service),
) -> CharacterListResponse:
    _require_project(project_id, current_user["id"])
    items = svc.list(project_id)
    total = len(items)
    page  = items[pagination.skip : pagination.skip + pagination.limit]
    return CharacterListResponse(
        items=[_to_out(c) for c in page],
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.post(
    "/projects/{project_id}/characters",
    response_model=CharacterOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new character",
)
async def create_character(
    project_id: str,
    payload: CharacterCreate,
    current_user: dict    = Depends(get_current_user),
    svc: CharacterService = Depends(get_character_service),
) -> CharacterOut:
    _require_project(project_id, current_user["id"])
    char = svc.create(
        project_id=project_id,
        owner_id=current_user["id"],
        name=payload.name,
        role=payload.role,
        age=payload.age,
        gender=payload.gender,
        appearance=payload.appearance,
        personality=payload.personality,
        backstory=payload.backstory,
        motivations=payload.motivations,
        flaws=payload.flaws,
    )
    return _to_out(char)


@router.get(
    "/projects/{project_id}/characters/{character_id}",
    response_model=CharacterOut,
    summary="Get a single character",
)
async def get_character(
    project_id: str,
    character_id: str,
    current_user: dict = Depends(get_current_user),
) -> CharacterOut:
    _require_project(project_id, current_user["id"])
    char = _require_character(character_id, project_id)
    return _to_out(char)


@router.patch(
    "/projects/{project_id}/characters/{character_id}",
    response_model=CharacterOut,
    summary="Update a character",
)
async def update_character(
    project_id: str,
    character_id: str,
    payload: CharacterUpdate,
    current_user: dict    = Depends(get_current_user),
    svc: CharacterService = Depends(get_character_service),
) -> CharacterOut:
    _require_project(project_id, current_user["id"])
    _require_character(character_id, project_id)
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = svc.update(character_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    return _to_out(updated)


@router.delete(
    "/projects/{project_id}/characters/{character_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a character",
    response_class=Response,
)
async def delete_character(
    project_id: str,
    character_id: str,
    current_user: dict    = Depends(get_current_user),
    svc: CharacterService = Depends(get_character_service),
):
    _require_project(project_id, current_user["id"])
    _require_character(character_id, project_id)
    svc.delete(character_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── AI endpoint ───────────────────────────────────────────────────────────────

@router.post(
    "/characters/{character_id}/generate-backstory",
    response_model=CharacterGenerateResponse,
    summary="Generate an AI backstory for a character",
)
async def generate_backstory(
    character_id: str,
    payload: CharacterGenerateRequest,
    current_user: dict    = Depends(get_current_user),
    svc: CharacterService = Depends(get_character_service),
) -> CharacterGenerateResponse:
    _require_character_by_owner(character_id, current_user["id"])
    try:
        updated_char, backstory, model_used = await svc.generate_backstory(
            character_id=character_id,
            style=payload.style or "detailed",
            model=payload.model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Backstory generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))

    return CharacterGenerateResponse(
        character=_to_out(updated_char),
        generated_backstory=backstory,
        model=model_used,
    )
