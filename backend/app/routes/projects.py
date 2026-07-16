"""
app/routes/projects.py — Projects route façade.

Exposes the projects router under the canonical ``app/routes/`` path.

Routes (mounted at /api in main.py)
------------------------------------
GET    /api/projects          — list user projects   → ProjectListResponse
POST   /api/projects          — create project       → ProjectOut (201)
GET    /api/projects/{id}     — get single project   → ProjectOut
PUT    /api/projects/{id}     — update project       → ProjectOut
DELETE /api/projects/{id}     — delete project       → 204
GET    /api/projects/{id}/stats — content statistics → ProjectStats

Implementation
--------------
Full async Motor logic lives in ``app/routers/projects.py`` +
``app/services/project_service.py``.

Project document schema
-----------------------
{
    "id":          str,           # MongoDB ObjectId as hex string
    "title":       str,           # project name
    "description": str | null,
    "genre":       str | null,
    "status":      "draft" | "active" | "completed" | "archived",
    "created_at":  datetime,      # UTC
    "updated_at":  datetime       # UTC
}
"""

from app.routers.projects import router  # re-export

__all__ = ["router"]
