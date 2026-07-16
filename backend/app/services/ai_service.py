"""
app/services/ai_service.py — Domain-agnostic AI service facade.

All domain services (story, character, world, prompt) delegate to this
layer rather than importing GraniteClient directly.  This decouples
business logic from the specific AI backend, making it easy to swap
Granite for another model or add caching/logging in one place.
"""

from __future__ import annotations

import logging
from typing import AsyncGenerator

from app.core.config import get_settings
from app.services.granite import GraniteClient, get_granite_client, GRANITE_TEXT_MODEL

logger   = logging.getLogger(__name__)
settings = get_settings()


# ── Prompt templates ──────────────────────────────────────────────────────────

_LENGTH_TOKENS = {
    "short":  400,
    "medium": 900,
    "long":   1800,
    "epic":   3500,
}


def _story_prompt(
    user_prompt: str,
    genre: str | None,
    tone: str | None,
    pov: str | None,
    length: str,
) -> str:
    parts = [
        "You are an expert creative fiction writer.",
        f"Write a compelling story based on the following premise:",
        f"\n\"{user_prompt}\"",
    ]
    if genre:
        parts.append(f"\nGenre: {genre}")
    if tone:
        parts.append(f"Tone: {tone}")
    if pov:
        parts.append(f"Point of view: {pov}")
    parts.append(
        f"\nWrite approximately {_LENGTH_TOKENS[length] // 2} words. "
        "Be vivid, engaging, and show rather than tell. Begin directly with the story."
    )
    return "\n".join(parts)


def _character_backstory_prompt(
    name: str,
    role: str,
    personality: str | None,
    motivations: str | None,
    flaws: str | None,
    style: str,
) -> str:
    style_map = {
        "brief":    "Write a concise 2-paragraph backstory.",
        "detailed": "Write a rich, detailed backstory of 4-6 paragraphs.",
        "dramatic": "Write a dramatic, emotionally charged backstory of 5 paragraphs with a dark twist.",
    }
    return (
        f"You are a creative fiction writer building a character profile.\n\n"
        f"Character: {name}\n"
        f"Role: {role}\n"
        f"Personality: {personality or 'Not specified'}\n"
        f"Core motivations: {motivations or 'Not specified'}\n"
        f"Flaws: {flaws or 'Not specified'}\n\n"
        f"{style_map.get(style, style_map['detailed'])} "
        f"Make it compelling and consistent with the traits above. "
        f"Write in third person, past tense. Start directly with the backstory."
    )


def _world_section_prompt(concept: str, section: str) -> str:
    section_instructions = {
        "geography": (
            "Describe the geography of this world in rich detail: "
            "continents, terrain types, climate zones, major bodies of water, and notable natural features."
        ),
        "cultures": (
            "Describe the cultures and civilisations of this world: "
            "major factions, social structures, customs, religions, and conflicts between groups."
        ),
        "history": (
            "Describe the history of this world: "
            "major historical eras, pivotal wars or events, the rise and fall of empires, and current political state."
        ),
        "magic_system": (
            "Describe the magic system of this world: "
            "its rules, costs, who can use it, how it manifests, and its role in society."
        ),
        "technology_level": (
            "Describe the technology level of this world: "
            "what tools and inventions exist, what doesn't exist yet, and how technology shapes daily life."
        ),
    }
    instruction = section_instructions.get(section, f"Describe the {section} of this world.")
    return (
        f"You are building lore for a fictional world based on this concept:\n"
        f"\"{concept}\"\n\n"
        f"{instruction}\n\n"
        f"Write 3-5 detailed paragraphs. Be specific, vivid, and internally consistent. "
        f"Start immediately with the content."
    )


def _prompt_enhance_prompt(original: str, style: str) -> str:
    style_instructions = {
        "concise":   "Rewrite the following AI prompt to be more concise and focused, keeping only the most impactful elements.",
        "detailed":  "Rewrite the following AI prompt to be more detailed and specific, adding context, tone, and descriptive depth.",
        "creative":  "Rewrite the following AI prompt to be more creative and evocative, using poetic language and unexpected angles.",
        "technical": "Rewrite the following AI prompt to be more technically precise, using genre-specific vocabulary and clear structure.",
    }
    instruction = style_instructions.get(style, style_instructions["detailed"])
    return (
        f"{instruction}\n\n"
        f"Original prompt:\n\"{original}\"\n\n"
        f"Provide only the rewritten prompt, without explanation or preamble."
    )


# ── AI Service ────────────────────────────────────────────────────────────────

class AIService:
    """
    High-level AI operations used by domain services.

    All methods return plain strings; persistence is handled by the
    domain service layer.
    """

    def __init__(self, client: GraniteClient | None = None) -> None:
        self._client = client or get_granite_client()

    async def generate_story(
        self,
        prompt: str,
        genre: str | None = None,
        tone: str | None  = None,
        pov: str | None   = None,
        length: str       = "medium",
        model: str | None = None,
    ) -> tuple[str, str]:
        """
        Returns (generated_text, model_used).
        """
        full_prompt = _story_prompt(prompt, genre, tone, pov, length)
        max_tokens  = _LENGTH_TOKENS.get(length, 900)
        model_used  = model or settings.watsonx_default_model
        text = await self._client.generate(
            prompt=full_prompt,
            model_id=model_used,
            max_new_tokens=max_tokens,
            temperature=0.85,
        )
        return text, model_used

    async def generate_character_backstory(
        self,
        name: str,
        role: str,
        personality: str | None,
        motivations: str | None,
        flaws: str | None,
        style: str        = "detailed",
        model: str | None = None,
    ) -> tuple[str, str]:
        """Returns (backstory_text, model_used)."""
        full_prompt = _character_backstory_prompt(name, role, personality, motivations, flaws, style)
        model_used  = model or settings.watsonx_default_model
        text = await self._client.generate(
            prompt=full_prompt,
            model_id=model_used,
            max_new_tokens=700,
            temperature=0.8,
        )
        return text, model_used

    async def generate_world_section(
        self,
        concept: str,
        section: str,
        model: str | None = None,
    ) -> tuple[str, str]:
        """Returns (section_text, model_used)."""
        full_prompt = _world_section_prompt(concept, section)
        model_used  = model or settings.watsonx_default_model
        text = await self._client.generate(
            prompt=full_prompt,
            model_id=model_used,
            max_new_tokens=600,
            temperature=0.75,
        )
        return text, model_used

    async def enhance_prompt(
        self,
        original: str,
        style: str        = "detailed",
        model: str | None = None,
    ) -> tuple[str, str]:
        """Returns (enhanced_text, model_used)."""
        full_prompt = _prompt_enhance_prompt(original, style)
        model_used  = model or settings.watsonx_default_model
        text = await self._client.generate(
            prompt=full_prompt,
            model_id=model_used,
            max_new_tokens=500,
            temperature=0.6,
        )
        return text.strip(), model_used

    async def stream_generate(
        self,
        prompt: str,
        model: str | None = None,
        max_new_tokens: int = 512,
    ) -> AsyncGenerator[str, None]:
        """Pass-through stream from Granite client."""
        return self._client.stream_generate(
            prompt=prompt,
            model_id=model or settings.watsonx_default_model,
            max_new_tokens=max_new_tokens,
        )


# ── Singleton ─────────────────────────────────────────────────────────────────

_ai_service: AIService | None = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
