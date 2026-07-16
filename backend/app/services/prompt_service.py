"""
app/services/prompt_service.py — Prompt CRUD + AI enhancement.
"""

from __future__ import annotations

import logging

import app.db as db
from app.services.ai_service import AIService, get_ai_service

logger = logging.getLogger(__name__)


class PromptService:

    def __init__(self, ai: AIService | None = None) -> None:
        self._ai = ai or get_ai_service()

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def list(self, owner_id: str) -> list[dict]:
        return db.get_prompts_by_user(owner_id)

    def get(self, prompt_id: str) -> dict | None:
        return db.get_prompt(prompt_id)

    def create(
        self,
        owner_id: str,
        title: str,
        content: str,
        category: str = "General",
        model: str | None = None,
        project_id: str | None = None,
        is_favourite: bool = False,
    ) -> dict:
        return db.create_prompt(
            owner_id=owner_id,
            title=title,
            content=content,
            category=category,
            model=model,
            project_id=project_id,
            is_favourite=is_favourite,
        )

    def update(self, prompt_id: str, **fields) -> dict | None:
        return db.update_prompt(prompt_id, **fields)

    def delete(self, prompt_id: str) -> bool:
        return db.delete_prompt(prompt_id)

    def record_use(self, prompt_id: str) -> None:
        """Increment the use counter for a prompt."""
        db.increment_prompt_use(prompt_id)

    # ── AI enhancement ────────────────────────────────────────────────────────

    async def enhance(
        self,
        owner_id: str,
        prompt_id: str | None    = None,
        content: str | None      = None,
        style: str               = "detailed",
        model: str | None        = None,
        save_enhanced: bool      = True,
    ) -> tuple[dict | None, str, str, str]:
        """
        Enhance a prompt with AI.

        Accepts either a prompt_id (uses its content) or raw content.
        Returns (saved_prompt | None, original_text, enhanced_text, model_used).
        """
        if prompt_id:
            stored = db.get_prompt(prompt_id)
            if stored is None:
                raise ValueError(f"Prompt '{prompt_id}' not found.")
            original = stored["content"]
        elif content:
            original = content
        else:
            raise ValueError("Either prompt_id or content must be provided.")

        enhanced, model_used = await self._ai.enhance_prompt(
            original=original,
            style=style,
            model=model,
        )
        logger.info("Prompt enhanced — style=%s model=%s", style, model_used)

        saved_prompt = None
        if save_enhanced and prompt_id is None:
            # Persist the enhanced prompt as a new record
            saved_prompt = db.create_prompt(
                owner_id=owner_id,
                title=f"Enhanced ({style}): {original[:40]}…",
                content=enhanced,
                category="Enhanced",
                model=model_used,
            )
        elif save_enhanced and prompt_id:
            # Update the existing prompt with the enhancement
            saved_prompt = db.update_prompt(prompt_id, content=enhanced)

        return saved_prompt, original, enhanced, model_used


def get_prompt_service() -> PromptService:
    return PromptService()
