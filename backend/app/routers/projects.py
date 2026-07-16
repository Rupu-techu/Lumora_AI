"""
app/routers/projects.py — Project CRUD endpoints for Lumora AI.

Routes
------
GET    /api/projects              → ProjectListResponse       200
POST   /api/projects              → ProjectOut                201
GET    /api/projects/{id}         → ProjectOut                200
PUT    /api/projects/{id}         → ProjectOut                200
DELETE /api/projects/{id}         → (empty body)              204
GET    /api/projects/{id}/stats   → ProjectStats              200

All database calls are fully async via Motor through ProjectService.
Authentication is enforced on every endpoint via the JWT dependency.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.dependencies import PaginationParams, get_current_user, paginate
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectOut,
    ProjectStats,
    ProjectUpdate,
)
from app.services.project_service import ProjectService, get_project_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


# ── Internal helpers ──────────────────────────────────────────────────────────

def _to_out(p: dict) -> ProjectOut:
    """Map a raw service dict → ProjectOut schema."""
    return ProjectOut(
        id              = p["id"],
        owner_id        = p.get("owner_id", ""),
        title           = p.get("title") or p.get("name", ""),
        description     = p.get("description"),
        genre           = p.get("genre"),
        status          = p.get("status", "draft"),
        scene_count     = p.get("scene_count", 0),
        character_count = p.get("character_count", 0),
        word_count      = p.get("word_count", 0),
        created_at      = p["created_at"],
        updated_at      = p["updated_at"],
    )


async def _require_owned(
    project_id: str,
    user_id:    str,
    svc:        ProjectService,
) -> dict:
    """
    Fetch a project and verify ownership.

    Raises HTTP 404 if not found or the caller is not the owner.
    """
    project = await svc.get_project(project_id)
    if project is None or project.get("owner_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    return project


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=ProjectListResponse,
    summary="List all projects for the current user",
)
async def list_projects(
    status_filter: str | None         = Query(
        default=None,
        alias="status",
        pattern=r"^(draft|active|completed|archived)$",
        description="Filter by lifecycle status",
    ),
    search: str | None                = Query(default=None, max_length=200),
    pagination: PaginationParams      = Depends(paginate),
    current_user: dict                = Depends(get_current_user),
    svc: ProjectService               = Depends(get_project_service),
) -> ProjectListResponse:
    """Return a paginated list of projects owned by the authenticated user."""
    items, total = await svc.list_projects(
        owner_id = current_user["id"],
        status   = status_filter,
        search   = search,
        skip     = pagination.skip,
        limit    = pagination.limit,
    )
    return ProjectListResponse(
        items = [_to_out(p) for p in items],
        total = total,
        skip  = pagination.skip,
        limit = pagination.limit,
    )


@router.post(
    "",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
async def create_project(
    payload:      ProjectCreate,
    current_user: dict          = Depends(get_current_user),
    svc:          ProjectService = Depends(get_project_service),
) -> ProjectOut:
    """Create a project and return the persisted document."""
    project = await svc.create_project(
        owner_id    = current_user["id"],
        title       = payload.title,
        description = payload.description,
        genre       = payload.genre,
        status      = payload.status,
    )
    return _to_out(project)


@router.get(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Get a single project by ID",
)
async def get_project(
    project_id:   str,
    current_user: dict           = Depends(get_current_user),
    svc:          ProjectService = Depends(get_project_service),
) -> ProjectOut:
    """Fetch one project. Returns 404 if not found or not owned by the caller."""
    project = await _require_owned(project_id, current_user["id"], svc)
    return _to_out(project)


@router.put(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Update a project (full or partial)",
)
async def update_project(
    project_id:   str,
    payload:      ProjectUpdate,
    current_user: dict           = Depends(get_current_user),
    svc:          ProjectService = Depends(get_project_service),
) -> ProjectOut:
    """
    Update one or more fields of a project.

    Only the authenticated owner may update a project.
    Responds with the full updated document on success.
    """
    await _require_owned(project_id, current_user["id"], svc)

    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    updated = await svc.update_project(project_id, **updates)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    return _to_out(updated)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project",
    response_class=Response,
)
async def delete_project(
    project_id:   str,
    current_user: dict           = Depends(get_current_user),
    svc:          ProjectService = Depends(get_project_service),
):
    """
    Permanently delete a project.

    Returns 204 No Content on success.
    Returns 404 if the project does not exist or is not owned by the caller.
    """
    await _require_owned(project_id, current_user["id"], svc)
    await svc.delete_project(project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{project_id}/stats",
    response_model=ProjectStats,
    summary="Get aggregated content statistics for a project",
)
async def get_project_stats(
    project_id:   str,
    current_user: dict           = Depends(get_current_user),
    svc:          ProjectService = Depends(get_project_service),
) -> ProjectStats:
    """Return story, character, world, prompt counts and total word count."""
    await _require_owned(project_id, current_user["id"], svc)
    stats = await svc.get_project_stats(
        project_id = project_id,
        owner_id   = current_user["id"],
    )
    return ProjectStats(**stats)
