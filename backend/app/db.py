"""
app/db.py — In-memory repository layer.

Provides typed CRUD helpers for every domain model.
Replace the in-memory dicts with SQLAlchemy / Motor / etc. when moving to a
persistent database — only these functions need to change.
"""

from __future__ import annotations

import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uid() -> str:
    return str(uuid.uuid4())


def _touch(record: dict) -> dict:
    record["updated_at"] = _now()
    return record


# ═══════════════════════════════════════════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════════════════════════════════════════

_users: dict[str, dict[str, Any]] = {}


def get_user_by_email(email: str) -> dict | None:
    for user in _users.values():
        if user["email"] == email:
            return user
    return None


def get_user_by_id(user_id: str) -> dict | None:
    return _users.get(user_id)


def create_user(name: str, email: str, hashed_password: str) -> dict:
    uid = _uid()
    user: dict[str, Any] = {
        "id": uid,
        "name": name,
        "email": email,
        "hashed_password": hashed_password,
        "bio": None,
        "avatar_url": None,
        "is_active": True,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _users[uid] = user
    return user


def update_user(user_id: str, **fields: Any) -> dict | None:
    user = _users.get(user_id)
    if not user:
        return None
    for key, value in fields.items():
        if key not in ("id", "hashed_password", "created_at"):
            user[key] = value
    return _touch(user)


# ═══════════════════════════════════════════════════════════════════════════════
# PROJECTS
# ═══════════════════════════════════════════════════════════════════════════════

_projects: dict[str, dict[str, Any]] = {}


def get_projects_by_user(
    user_id: str,
    status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[dict], int]:
    items = [p for p in _projects.values() if p["owner_id"] == user_id]
    if status:
        items = [p for p in items if p["status"] == status]
    if search:
        q = search.lower()
        items = [p for p in items if q in p["name"].lower() or q in (p.get("description") or "").lower()]
    items.sort(key=lambda p: p["updated_at"], reverse=True)
    return items[skip : skip + limit], len(items)


def get_project(project_id: str) -> dict | None:
    return _projects.get(project_id)


def create_project(
    user_id: str,
    name: str,
    description: str | None,
    genre: str | None = None,
    color: str | None = None,
) -> dict:
    uid = _uid()
    project: dict[str, Any] = {
        "id": uid,
        "owner_id": user_id,
        "name": name,
        "description": description,
        "genre": genre,
        "color": color or "#7c3aed",
        "status": "draft",
        "scene_count": 0,
        "character_count": 0,
        "word_count": 0,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _projects[uid] = project
    return project


def update_project(project_id: str, **fields: Any) -> dict | None:
    project = _projects.get(project_id)
    if not project:
        return None
    for key, value in fields.items():
        if key not in ("id", "owner_id", "created_at"):
            project[key] = value
    return _touch(project)


def delete_project(project_id: str) -> bool:
    if project_id in _projects:
        del _projects[project_id]
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════════
# STORIES
# ═══════════════════════════════════════════════════════════════════════════════

_stories: dict[str, dict[str, Any]] = {}


def get_stories_by_project(project_id: str) -> list[dict]:
    return sorted(
        [s for s in _stories.values() if s["project_id"] == project_id],
        key=lambda s: s["updated_at"],
        reverse=True,
    )


def get_story(story_id: str) -> dict | None:
    return _stories.get(story_id)


def create_story(
    project_id: str,
    owner_id: str,
    title: str,
    content: str = "",
    genre: str | None = None,
    tone: str | None = None,
    pov: str | None = None,
    act: str | None = None,
    prompt_used: str | None = None,
    ai_generated: bool = False,
) -> dict:
    uid = _uid()
    story: dict[str, Any] = {
        "id": uid,
        "project_id": project_id,
        "owner_id": owner_id,
        "title": title,
        "content": content,
        "genre": genre,
        "tone": tone,
        "pov": pov,
        "act": act,
        "word_count": len(content.split()) if content else 0,
        "prompt_used": prompt_used,
        "ai_generated": ai_generated,
        "status": "draft",
        "created_at": _now(),
        "updated_at": _now(),
    }
    _stories[uid] = story
    # Update project word count
    project = _projects.get(project_id)
    if project:
        project["word_count"] = project.get("word_count", 0) + story["word_count"]
        _touch(project)
    return story


def update_story(story_id: str, **fields: Any) -> dict | None:
    story = _stories.get(story_id)
    if not story:
        return None
    for key, value in fields.items():
        if key not in ("id", "owner_id", "project_id", "created_at"):
            story[key] = value
    if "content" in fields:
        story["word_count"] = len((fields["content"] or "").split())
    return _touch(story)


def delete_story(story_id: str) -> bool:
    if story_id in _stories:
        del _stories[story_id]
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════════
# CHARACTERS
# ═══════════════════════════════════════════════════════════════════════════════

_characters: dict[str, dict[str, Any]] = {}


def get_characters_by_project(project_id: str) -> list[dict]:
    return sorted(
        [c for c in _characters.values() if c["project_id"] == project_id],
        key=lambda c: c["updated_at"],
        reverse=True,
    )


def get_character(character_id: str) -> dict | None:
    return _characters.get(character_id)


def create_character(
    project_id: str,
    owner_id: str,
    name: str,
    role: str = "Other",
    age: str | None = None,
    gender: str | None = None,
    appearance: str | None = None,
    personality: str | None = None,
    backstory: str | None = None,
    motivations: str | None = None,
    flaws: str | None = None,
    ai_generated: bool = False,
) -> dict:
    uid = _uid()
    character: dict[str, Any] = {
        "id": uid,
        "project_id": project_id,
        "owner_id": owner_id,
        "name": name,
        "role": role,
        "age": age,
        "gender": gender,
        "appearance": appearance,
        "personality": personality,
        "backstory": backstory,
        "motivations": motivations,
        "flaws": flaws,
        "ai_generated": ai_generated,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _characters[uid] = character
    project = _projects.get(project_id)
    if project:
        project["character_count"] = project.get("character_count", 0) + 1
        _touch(project)
    return character


def update_character(character_id: str, **fields: Any) -> dict | None:
    char = _characters.get(character_id)
    if not char:
        return None
    for key, value in fields.items():
        if key not in ("id", "owner_id", "project_id", "created_at"):
            char[key] = value
    return _touch(char)


def delete_character(character_id: str) -> bool:
    char = _characters.get(character_id)
    if char:
        project = _projects.get(char["project_id"])
        if project and project.get("character_count", 0) > 0:
            project["character_count"] -= 1
        del _characters[character_id]
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════════
# WORLDS
# ═══════════════════════════════════════════════════════════════════════════════

_worlds: dict[str, dict[str, Any]] = {}


def get_worlds_by_project(project_id: str) -> list[dict]:
    return sorted(
        [w for w in _worlds.values() if w["project_id"] == project_id],
        key=lambda w: w["updated_at"],
        reverse=True,
    )


def get_world(world_id: str) -> dict | None:
    return _worlds.get(world_id)


def create_world(
    project_id: str,
    owner_id: str,
    name: str,
    description: str | None = None,
    geography: str | None = None,
    cultures: str | None = None,
    history: str | None = None,
    magic_system: str | None = None,
    technology_level: str | None = None,
    notable_locations: list[str] | None = None,
    ai_generated: bool = False,
) -> dict:
    uid = _uid()
    world: dict[str, Any] = {
        "id": uid,
        "project_id": project_id,
        "owner_id": owner_id,
        "name": name,
        "description": description,
        "geography": geography,
        "cultures": cultures,
        "history": history,
        "magic_system": magic_system,
        "technology_level": technology_level,
        "notable_locations": notable_locations or [],
        "ai_generated": ai_generated,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _worlds[uid] = world
    return world


def update_world(world_id: str, **fields: Any) -> dict | None:
    world = _worlds.get(world_id)
    if not world:
        return None
    for key, value in fields.items():
        if key not in ("id", "owner_id", "project_id", "created_at"):
            world[key] = value
    return _touch(world)


def delete_world(world_id: str) -> bool:
    if world_id in _worlds:
        del _worlds[world_id]
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════════
# PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

_prompts: dict[str, dict[str, Any]] = {}


def get_prompts_by_user(owner_id: str) -> list[dict]:
    return sorted(
        [p for p in _prompts.values() if p["owner_id"] == owner_id],
        key=lambda p: p["updated_at"],
        reverse=True,
    )


def get_prompt(prompt_id: str) -> dict | None:
    return _prompts.get(prompt_id)


def create_prompt(
    owner_id: str,
    title: str,
    content: str,
    category: str = "General",
    model: str | None = None,
    project_id: str | None = None,
    is_favourite: bool = False,
) -> dict:
    uid = _uid()
    prompt: dict[str, Any] = {
        "id": uid,
        "owner_id": owner_id,
        "project_id": project_id,
        "title": title,
        "content": content,
        "category": category,
        "model": model,
        "is_favourite": is_favourite,
        "use_count": 0,
        "created_at": _now(),
        "updated_at": _now(),
    }
    _prompts[uid] = prompt
    return prompt


def update_prompt(prompt_id: str, **fields: Any) -> dict | None:
    prompt = _prompts.get(prompt_id)
    if not prompt:
        return None
    for key, value in fields.items():
        if key not in ("id", "owner_id", "created_at"):
            prompt[key] = value
    return _touch(prompt)


def delete_prompt(prompt_id: str) -> bool:
    if prompt_id in _prompts:
        del _prompts[prompt_id]
        return True
    return False


def increment_prompt_use(prompt_id: str) -> None:
    prompt = _prompts.get(prompt_id)
    if prompt:
        prompt["use_count"] = prompt.get("use_count", 0) + 1
        _touch(prompt)
