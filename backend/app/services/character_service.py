"""
app/services/character_service.py — Character CRUD + AI backstory generation.
"""

from __future__ import annotations

import logging

import app.db as db
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)


class CharacterService:

    def __init__(self, ai: AIService | None = None) -> None:
        self._ai = ai or get_ai_service()

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list(self, project_id: str) -> list[dict]:
        return db.get_characters_by_project(project_id)

    def get(self, character_id: str) -> dict | None:
        return db.get_character(character_id)

    def create(
        self,
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
    ) -> dict:
        return db.create_character(
            project_id=project_id,
            owner_id=owner_id,
            name=name,
            role=role,
            age=age,
            gender=gender,
            appearance=appearance,
            personality=personality,
            backstory=backstory,
            motivations=motivations,
            flaws=flaws,
            ai_generated=False,
        )

    def update(self, character_id: str, **fields) -> dict | None:
        return db.update_character(character_id, **fields)

    def delete(self, character_id: str) -> bool:
        return db.delete_character(character_id)

    # ── AI generation ─────────────────────────────────────────────────────────

    async def generate_backstory(
        self,
        character_id: str,
        style: str        = "detailed",
        model: str | None = None,
    ) -> tuple[dict, str, str]:
        """
        Generate an AI backstory for an existing character and persist it.

        Returns (updated_character, generated_backstory, model_used).
        Raises ValueError if character_id is not found.
        """
        char = db.get_character(character_id)
        if char is None:
            raise ValueError(f"Character '{character_id}' not found.")

        backstory, model_used = await self._ai.generate_character_backstory(
            name=char["name"],
            role=char["role"],
            personality=char.get("personality"),
            motivations=char.get("motivations"),
            flaws=char.get("flaws"),
            style=style,
            model=model,
        )
        logger.info("Backstory generated for character '%s' — model=%s", char["name"], model_used)

        updated = db.update_character(character_id, backstory=backstory, ai_generated=True)
        return updated, backstory, model_used


def get_character_service() -> CharacterService:
    return CharacterService()
