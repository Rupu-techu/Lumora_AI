"""
app/routes/stories.py — Stories route façade.

Exposes the stories router under the canonical ``app/routes/`` path.

Routes (mounted at /api in main.py)
------------------------------------
GET    /api/projects/{pid}/stories          — list stories         → StoryListResponse
POST   /api/projects/{pid}/stories          — create story         → StoryOut (201)
GET    /api/projects/{pid}/stories/{id}     — get single story     → StoryOut
PATCH  /api/projects/{pid}/stories/{id}     — update story         → StoryOut
DELETE /api/projects/{pid}/stories/{id}     — delete story         → 204
POST   /api/stories/generate                — AI story generation  → StoryGenerateResponse

Implementation
--------------
Full logic lives in ``app/routers/stories.py`` +
``app/services/story_service.py`` + ``app/services/ai_service.py``.

IBM Granite integration
-----------------------
The generate endpoint calls ``AIService.generate_story()`` which delegates
to ``GraniteClient.generate()``.  When ``WATSONX_API_KEY`` is not set the
service returns a safe mock response so development works offline.
"""

from app.routers.stories import router  # re-export

__all__ = ["router"]
