"""
app/services/project_service.py — Project CRUD service for Lumora AI.

All database operations are fully async using Motor
(AsyncIOMotorDatabase / AsyncIOMotorCollection).

Design notes
------------
- ObjectId (_id) is stored by MongoDB; we expose a string ``id`` to clients.
- The Beanie ``Project`` document model uses the field ``name`` internally.
  This service accepts ``title`` from the API layer and maps it to ``name``
  on write, and maps it back to ``title`` on read.
- ``updated_at`` is always set to UTC now on every write operation.
- Pydantic schemas are used for validation upstream (in routers); this
  service receives already-validated plain Python values.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, ReturnDocument

from app.database import get_db

logger = logging.getLogger(__name__)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _to_oid(raw_id: str) -> ObjectId | None:
    """Convert a hex string to ObjectId, returning None on invalid input."""
    try:
        return ObjectId(raw_id)
    except (InvalidId, TypeError):
        return None


def _doc_to_dict(doc: dict) -> dict:
    """Normalise a raw MongoDB document for the API layer.

    - Converts ``_id`` (ObjectId) → ``id`` (str)
    - Maps ``name`` → ``title`` so the API field matches the spec
    - Maps ``owner.$id`` / link object → plain ``owner_id`` string
    """
    if doc is None:
        return None

    result = {**doc}

    # _id → id
    if "_id" in result:
        result["id"] = str(result.pop("_id"))

    # name → title (Beanie model uses name; API spec uses title)
    if "name" in result and "title" not in result:
        result["title"] = result.pop("name")

    # Resolve owner link → owner_id string
    owner = result.get("owner")
    if isinstance(owner, dict):
        # Beanie DBRef-style: {"$id": ObjectId(...), "$ref": "users"}
        oid = owner.get("$id") or owner.get("id")
        result["owner_id"] = str(oid) if oid else ""
        del result["owner"]
    elif isinstance(owner, ObjectId):
        result["owner_id"] = str(owner)
        del result["owner"]
    elif "owner_id" not in result:
        result["owner_id"] = ""

    return result


def _collection() -> AsyncIOMotorCollection:
    db: AsyncIOMotorDatabase = get_db()
    return db["projects"]


# ═══════════════════════════════════════════════════════════════════════════════
# ProjectService
# ═══════════════════════════════════════════════════════════════════════════════

class ProjectService:
    """Async CRUD service for the ``projects`` MongoDB collection."""

    # ── List ──────────────────────────────────────────────────────────────────

    async def list_projects(
        self,
        owner_id: str,
        status: str | None = None,
        search: str | None = None,
        skip: int  = 0,
        limit: int = 20,
    ) -> tuple[list[dict], int]:
        """
        Return a paginated list of projects owned by ``owner_id``.

        Parameters
        ----------
        owner_id : str
            The owning user's string ID.
        status : str | None
            Optional status filter (draft|active|completed|archived).
        search : str | None
            Optional text search against title and description.
        skip / limit : int
            Pagination offsets.

        Returns
        -------
        (items, total)  where items is already normalised via _doc_to_dict.
        """
        col    = _collection()
        oid    = _to_oid(owner_id)

        # Build the filter
        filt: dict[str, Any] = {}
        if oid:
            # Beanie stores owner as a DBRef-like dict {"$id": ObjectId, "$ref": "users"}
            filt["$or"] = [
                {"owner.$id": oid},
                {"owner_id": owner_id},
            ]
        else:
            filt["owner_id"] = owner_id

        if status:
            filt["status"] = status

        if search:
            filt["$text"] = {"$search": search}

        total = await col.count_documents(filt)
        cursor = (
            col.find(filt)
               .sort("updated_at", DESCENDING)
               .skip(skip)
               .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        return [_doc_to_dict(d) for d in docs], total

    # ── Get ───────────────────────────────────────────────────────────────────

    async def get_project(self, project_id: str) -> dict | None:
        """Return a single project by its string ID, or None."""
        oid = _to_oid(project_id)
        if oid is None:
            return None
        doc = await _collection().find_one({"_id": oid})
        return _doc_to_dict(doc) if doc else None

    # ── Create ────────────────────────────────────────────────────────────────

    async def create_project(
        self,
        owner_id:    str,
        title:       str,
        description: str | None = None,
        genre:       str | None = None,
        status:      str        = "draft",
    ) -> dict:
        """
        Insert a new project document and return the normalised dict.

        The ``title`` argument is stored as ``name`` in MongoDB (preserving
        the Beanie model schema) and exposed back as ``title`` via
        ``_doc_to_dict``.
        """
        oid_owner = _to_oid(owner_id)
        now       = _utcnow()

        doc: dict[str, Any] = {
            # Store as "name" to match Beanie model + existing routers
            "name":            title,
            # Store owner as Beanie DBRef-style so Beanie can resolve it
            "owner":           {"$id": oid_owner, "$ref": "users"} if oid_owner else owner_id,
            "description":     description,
            "genre":           genre,
            "color":           "#7c3aed",
            "status":          status,
            "tags":            [],
            "is_public":       False,
            "scene_count":     0,
            "character_count": 0,
            "word_count":      0,
            "created_at":      now,
            "updated_at":      now,
        }

        result = await _collection().insert_one(doc)
        doc["_id"] = result.inserted_id
        logger.info("Project created — id=%s  title=%r  owner=%s",
                    result.inserted_id, title, owner_id)
        return _doc_to_dict(doc)

    # ── Update ────────────────────────────────────────────────────────────────

    async def update_project(
        self,
        project_id: str,
        **fields: Any,
    ) -> dict | None:
        """
        Apply a partial update to a project.

        The ``title`` key (from the API) is remapped to ``name`` before
        writing so the stored document stays consistent with the Beanie model.

        Returns the updated document, or None if not found.
        """
        oid = _to_oid(project_id)
        if oid is None:
            return None

        # title → name mapping
        if "title" in fields:
            fields["name"] = fields.pop("title")

        fields["updated_at"] = _utcnow()

        doc = await _collection().find_one_and_update(
            {"_id": oid},
            {"$set": fields},
            return_document=ReturnDocument.AFTER,
        )
        if doc is None:
            return None

        logger.info("Project updated — id=%s  fields=%s", project_id, list(fields.keys()))
        return _doc_to_dict(doc)

    # ── Delete ────────────────────────────────────────────────────────────────

    async def delete_project(self, project_id: str) -> bool:
        """Delete a project by ID.  Returns True if a document was deleted."""
        oid = _to_oid(project_id)
        if oid is None:
            return False

        result = await _collection().delete_one({"_id": oid})
        deleted = result.deleted_count > 0
        if deleted:
            logger.info("Project deleted — id=%s", project_id)
        return deleted

    # ── Stats ─────────────────────────────────────────────────────────────────

    async def get_project_stats(
        self,
        project_id: str,
        owner_id:   str,
    ) -> dict[str, int]:
        """
        Return aggregated content counts for a project.

        Queries the ``stories``, ``characters``, ``worlds``, and ``prompts``
        collections asynchronously using Motor.
        """
        db:   AsyncIOMotorDatabase = get_db()
        oid   = _to_oid(project_id)
        oid_owner = _to_oid(owner_id)

        if oid is None:
            return {"story_count": 0, "character_count": 0,
                    "world_count": 0, "prompt_count": 0, "word_count": 0}

        proj_filter = {"project.$id": oid}

        story_count     = await db["stories"].count_documents(proj_filter)
        character_count = await db["characters"].count_documents(proj_filter)
        world_count     = await db["worlds"].count_documents(proj_filter)

        # Prompts may have project_id stored as string or as a DBRef
        prompt_count = await db["prompts"].count_documents({
            "$or": [
                {"project.$id": oid},
                {"project_id": project_id},
            ],
            "$or": [  # noqa: duplicate key — last wins; owner filter
                {"owner.$id": oid_owner},
                {"owner_id": owner_id},
            ],
        }) if oid_owner else 0

        # Pull word_count from the project itself
        proj_doc    = await _collection().find_one({"_id": oid}, {"word_count": 1})
        word_count  = (proj_doc or {}).get("word_count", 0)

        return {
            "story_count":     story_count,
            "character_count": character_count,
            "world_count":     world_count,
            "prompt_count":    prompt_count,
            "word_count":      word_count,
        }


# ── Dependency-injection factory ──────────────────────────────────────────────

def get_project_service() -> ProjectService:
    """FastAPI dependency — returns a ProjectService instance."""
    return ProjectService()
