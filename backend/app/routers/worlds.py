"""
app/routers/worlds.py — World CRUD + AI lore generation endpoints.

Routes
------
GET    /api/projects/{pid}/worlds               → WorldListResponse
POST   /api/projects/{pid}/worlds               → WorldOut (201)
GET    /api/projects/{pid}/worlds/{id}          → WorldOut
PATCH  /api/projects/{pid}/worlds/{id}          → WorldOut
DELETE /api/projects/{pid}/worlds/{id}          → 204
POST   /api/worlds/generate                     → WorldGenerateResponse
PATCH  /api/worlds/{id}/expand/{section}        → WorldOut
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

import app.db as db
from app.core.dependencies import PaginationParams, get_current_user, paginate
from app.schemas import (
    WorldCreate,
    WorldGenerateRequest,
    WorldGenerateResponse,
    WorldListResponse,
    WorldOut,
    WorldUpdate,
)
from app.services.world_service import WorldService, get_world_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["worlds"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_out(w: dict) -> WorldOut:
    return WorldOut(
        id=w["id"],
        project_id=w["project_id"],
        name=w["name"],
        description=w.get("description"),
        geography=w.get("geography"),
        cultures=w.get("cultures"),
        history=w.get("history"),
        magic_system=w.get("magic_system"),
        technology_level=w.get("technology_level"),
        notable_locations=w.get("notable_locations", []),
        ai_generated=w.get("ai_generated", False),
        created_at=w["created_at"],
        updated_at=w["updated_at"],
    )


def _require_project(project_id: str, user_id: str) -> None:
    p = db.get_project(project_id)
    if p is None or p["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="Project not found.")


def _require_world(world_id: str, project_id: str) -> dict:
    w = db.get_world(world_id)
    if w is None or w["project_id"] != project_id:
        raise HTTPException(status_code=404, detail="World not found.")
    return w


def _require_world_by_owner(world_id: str, user_id: str) -> dict:
    w = db.get_world(world_id)
    if w is None or w["owner_id"] != user_id:
        raise HTTPException(status_code=404, detail="World not found.")
    return w


# ── CRUD endpoints ────────────────────────────────────────────────────────────

@router.get(
    "/projects/{project_id}/worlds",
    response_model=WorldListResponse,
    summary="List worlds in a project",
)
async def list_worlds(
    project_id: str,
    pagination: PaginationParams = Depends(paginate),
    current_user: dict           = Depends(get_current_user),
    svc: WorldService            = Depends(get_world_service),
) -> WorldListResponse:
    _require_project(project_id, current_user["id"])
    items = svc.list(project_id)
    total = len(items)
    page  = items[pagination.skip : pagination.skip + pagination.limit]
    return WorldListResponse(
        items=[_to_out(w) for w in page],
        total=total,
        skip=pagination.skip,
        limit=pagination.limit,
    )


@router.post(
    "/projects/{project_id}/worlds",
    response_model=WorldOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a world manually",
)
async def create_world(
    project_id: str,
    payload: WorldCreate,
    current_user: dict = Depends(get_current_user),
    svc: WorldService  = Depends(get_world_service),
) -> WorldOut:
    _require_project(project_id, current_user["id"])
    world = svc.create(
        project_id=project_id,
        owner_id=current_user["id"],
        name=payload.name,
        description=payload.description,
        geography=payload.geography,
        cultures=payload.cultures,
        history=payload.history,
        magic_system=payload.magic_system,
        technology_level=payload.technology_level,
        notable_locations=payload.notable_locations,
    )
    return _to_out(world)


@router.get(
    "/projects/{project_id}/worlds/{world_id}",
    response_model=WorldOut,
    summary="Get a single world",
)
async def get_world(
    project_id: str,
    world_id: str,
    current_user: dict = Depends(get_current_user),
) -> WorldOut:
    _require_project(project_id, current_user["id"])
    world = _require_world(world_id, project_id)
    return _to_out(world)


@router.patch(
    "/projects/{project_id}/worlds/{world_id}",
    response_model=WorldOut,
    summary="Update a world",
)
async def update_world(
    project_id: str,
    world_id: str,
    payload: WorldUpdate,
    current_user: dict = Depends(get_current_user),
    svc: WorldService  = Depends(get_world_service),
) -> WorldOut:
    _require_project(project_id, current_user["id"])
    _require_world(world_id, project_id)
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = svc.update(world_id, **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="World not found.")
    return _to_out(updated)


@router.delete(
    "/projects/{project_id}/worlds/{world_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a world",
    response_class=Response,
)
async def delete_world(
    project_id: str,
    world_id: str,
    current_user: dict = Depends(get_current_user),
    svc: WorldService  = Depends(get_world_service),
):
    _require_project(project_id, current_user["id"])
    _require_world(world_id, project_id)
    svc.delete(world_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── AI endpoints ──────────────────────────────────────────────────────────────

@router.post(
    "/worlds/generate",
    response_model=WorldGenerateResponse,
    summary="Generate world lore from a concept with IBM Granite AI",
)
async def generate_world(
    payload: WorldGenerateRequest,
    current_user: dict = Depends(get_current_user),
    svc: WorldService  = Depends(get_world_service),
) -> WorldGenerateResponse:
    _require_project(payload.project_id, current_user["id"])
    try:
        world, generated_sections, model_used = await svc.generate_world(
            project_id=payload.project_id,
            owner_id=current_user["id"],
            concept=payload.concept,
            sections=payload.sections,
            model=payload.model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("World generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))

    return WorldGenerateResponse(
        world=_to_out(world),
        generated_sections=generated_sections,
        model=model_used,
    )


@router.patch(
    "/worlds/{world_id}/expand/{section}",
    response_model=WorldOut,
    summary="Re-generate a single section of a world with AI",
)
async def expand_section(
    world_id: str,
    section: str = Path(..., pattern=r"^(geography|cultures|history|magic_system|technology_level)$"),
    concept: str | None = None,
    model: str | None   = None,
    current_user: dict  = Depends(get_current_user),
    svc: WorldService   = Depends(get_world_service),
) -> WorldOut:
    _require_world_by_owner(world_id, current_user["id"])
    try:
        updated, _, _ = await svc.expand_section(world_id, section, concept, model)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Section expansion failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    return _to_out(updated)
