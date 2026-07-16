"""
app/services/world_service.py — World CRUD + AI lore generation.
"""

from __future__ import annotations

import asyncio
import logging

import app.db as db
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)

# Sections that can be AI-generated
WORLD_SECTIONS = frozenset(
    {"geography", "cultures", "history", "magic_system", "technology_level"}
)


class WorldService:

    def __init__(self, ai: AIService | None = None) -> None:
        self._ai = ai or get_ai_service()

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list(self, project_id: str) -> list[dict]:
        return db.get_worlds_by_project(project_id)

    def get(self, world_id: str) -> dict | None:
        return db.get_world(world_id)

    def create(
        self,
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
    ) -> dict:
        return db.create_world(
            project_id=project_id,
            owner_id=owner_id,
            name=name,
            description=description,
            geography=geography,
            cultures=cultures,
            history=history,
            magic_system=magic_system,
            technology_level=technology_level,
            notable_locations=notable_locations,
            ai_generated=False,
        )

    def update(self, world_id: str, **fields) -> dict | None:
        return db.update_world(world_id, **fields)

    def delete(self, world_id: str) -> bool:
        return db.delete_world(world_id)

    # ── AI generation ─────────────────────────────────────────────────────────

    async def generate_world(
        self,
        project_id: str,
        owner_id: str,
        concept: str,
        sections: list[str],
        model: str | None = None,
    ) -> tuple[dict, dict[str, str], str]:
        """
        Generate a new world (or multiple lore sections) from a concept.

        Sections are generated concurrently.

        Returns (world_record, {section: generated_text}, model_used).
        """
        valid_sections = [s for s in sections if s in WORLD_SECTIONS]
        if not valid_sections:
            raise ValueError(f"No valid sections requested. Choose from: {WORLD_SECTIONS}")

        # Generate all requested sections concurrently
        tasks = {
            section: self._ai.generate_world_section(concept, section, model)
            for section in valid_sections
        }
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        generated: dict[str, str] = {}
        model_used = model or "ibm/granite-13b-instruct-v2"
        for section, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                logger.error("World section '%s' generation failed: %s", section, result)
                generated[section] = f"[Generation failed: {result}]"
            else:
                text, model_used = result
                generated[section] = text

        # Derive a world name from the concept
        words = concept.split()
        world_name = " ".join(w.capitalize() for w in words[:4]) if words else "Generated World"

        world = db.create_world(
            project_id=project_id,
            owner_id=owner_id,
            name=world_name,
            description=concept[:200],
            geography=generated.get("geography"),
            cultures=generated.get("cultures"),
            history=generated.get("history"),
            magic_system=generated.get("magic_system"),
            technology_level=generated.get("technology_level"),
            ai_generated=True,
        )

        logger.info("World '%s' generated — %d sections — model=%s", world["name"], len(generated), model_used)
        return world, generated, model_used

    async def expand_section(
        self,
        world_id: str,
        section: str,
        concept: str | None = None,
        model: str | None = None,
    ) -> tuple[dict, str, str]:
        """
        Re-generate (or expand) a single section of an existing world.

        Returns (updated_world, section_text, model_used).
        """
        world = db.get_world(world_id)
        if world is None:
            raise ValueError(f"World '{world_id}' not found.")
        if section not in WORLD_SECTIONS:
            raise ValueError(f"Invalid section '{section}'.")

        effective_concept = concept or world.get("description") or world["name"]
        text, model_used = await self._ai.generate_world_section(effective_concept, section, model)
        updated = db.update_world(world_id, **{section: text})
        return updated, text, model_used


def get_world_service() -> WorldService:
    return WorldService()
