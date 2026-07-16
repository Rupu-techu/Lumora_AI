"""
app/routes — Public route façades for Lumora AI.

This package re-exports the routers from ``app/routers/`` under the clean
path structure requested in the hackathon spec:

    app/routes/auth.py       →  /api/auth/*
    app/routes/projects.py   →  /api/projects/*
    app/routes/stories.py    →  /api/projects/{id}/stories/*
    app/routes/characters.py →  /api/projects/{id}/characters/*
    app/routes/ai.py         →  /api/ai/*   (IBM Granite integration)

Why have both ``routes/`` and ``routers/``?
-------------------------------------------
``routers/`` contains the full implementation (service calls, helpers,
response models).  ``routes/`` is the *public interface* — a thin import
façade that lets you add route-level middleware, versioning, or
documentation overrides without touching business logic.

Importing from either location works:

    from app.routes   import projects   # new canonical path
    from app.routers  import projects   # legacy path — still works
"""

from app.routes import ai, auth, characters, projects, stories

__all__ = ["auth", "projects", "stories", "characters", "ai"]
