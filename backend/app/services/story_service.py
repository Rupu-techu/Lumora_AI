"""
app/services/story_service.py — Story CRUD + AI generation.
"""

from __future__ import annotations

import logging

import app.db as db
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)

_LENGTH_TITLE_MAP = {
    "short": "Short Story",
    "medium": "Story",
    "long": "Long-form Story",
    "epic": "Epic Narrative",
}


class StoryService:

    def __init__(self, ai: AIService | None = None) -> None:
        self._ai = ai or get_ai_service()

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list(self, project_id: str) -> list[dict]:
        return db.get_stories_by_project(project_id)

    def get(self, story_id: str) -> dict | None:
        return db.get_story(story_id)

    def create(
        self,
        project_id: str,
        owner_id: str,
        title: str,
        content: str = "",
        genre: str | None = None,
        tone: str | None = None,
        pov: str | None = None,
        act: str | None = None,
    ) -> dict:
        return db.create_story(
            project_id=project_id,
            owner_id=owner_id,
            title=title,
            content=content,
            genre=genre,
            tone=tone,
            pov=pov,
            act=act,
            ai_generated=False,
        )

    def update(self, story_id: str, **fields) -> dict | None:
        return db.update_story(story_id, **fields)

    def delete(self, story_id: str) -> bool:
        return db.delete_story(story_id)

    # ── AI generation ─────────────────────────────────────────────────────────

    async def generate(
        self,
        project_id: str,
        owner_id: str,
        prompt: str,
        genre: str | None = None,
        tone: str | None = None,
        pov: str | None = None,
        length: str = "medium",
        model: str | None = None,
        save: bool = True,
    ) -> tuple[dict | None, str, str]:
        """
        Generate a story with AI.

        Returns (story_record | None, generated_text, model_used).
        story_record is None when save=False.
        """
        generated_text, model_used = await self._ai.generate_story(
            prompt=prompt,
            genre=genre,
            tone=tone,
            pov=pov,
            length=length,
            model=model,
        )
        logger.info("Story generated — %d words — model=%s", len(generated_text.split()), model_used)

        story_record = None
        if save:
            title = self._derive_title(generated_text, length)
            story_record = db.create_story(
                project_id=project_id,
                owner_id=owner_id,
                title=title,
                content=generated_text,
                genre=genre,
                tone=tone,
                pov=pov,
                prompt_used=prompt,
                ai_generated=True,
            )

        return story_record, generated_text, model_used

    @staticmethod
    def _derive_title(text: str, length: str) -> str:
        """Extract first sentence as title, or fall back to a generic label."""
        first_sentence = text.split(".")[0].strip()
        if 5 < len(first_sentence) <= 80:
            return first_sentence
        return _LENGTH_TITLE_MAP.get(length, "Generated Story")


def get_story_service() -> StoryService:
    return StoryService()
