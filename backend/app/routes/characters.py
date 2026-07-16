"""
app/routes/characters.py — Characters route façade.

Exposes the characters router under the canonical ``app/routes/`` path.

Routes (mounted at /api in main.py)
------------------------------------
GET    /api/projects/{pid}/characters           — list characters     → CharacterListResponse
POST   /api/projects/{pid}/characters           — create character    → CharacterOut (201)
GET    /api/projects/{pid}/characters/{id}      — get character       → CharacterOut
PATCH  /api/projects/{pid}/characters/{id}      — update character    → CharacterOut
DELETE /api/projects/{pid}/characters/{id}      — delete character    → 204
POST   /api/characters/{id}/generate-backstory  — AI backstory        → CharacterGenerateResponse

Implementation
--------------
Full logic lives in ``app/routers/characters.py`` +
``app/services/character_service.py`` + ``app/services/ai_service.py``.
"""

from app.routers.characters import router  # re-export

__all__ = ["router"]
