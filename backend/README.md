# Lumora AI — Backend

> **IBM SkillsBuild Hackathon 2024**  
> AI-powered creative workspace for stories, characters, worlds, and storyboards — powered by IBM Granite.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [MongoDB Collections](#mongodb-collections)
7. [API Reference](#api-reference)
8. [IBM Granite Integration](#ibm-granite-integration)
9. [Architecture Decisions](#architecture-decisions)
10. [Development Guide](#development-guide)

---

## Overview

Lumora AI is a creative writing assistant that uses IBM Granite foundation models to help users:

- ✍️  Generate and edit **stories** with AI
- 🎭  Build **character** profiles with AI-written backstories
- 🌍  Create rich **world** lore (geography, cultures, history, magic)
- 📋  Organise scenes on a **storyboard**
- 🖼️  Manage creative **assets**
- 💡  Save and enhance **prompt** templates

The backend exposes a clean REST API built on **FastAPI** with a fully async **Motor** MongoDB driver.

---

## Project Structure

```
backend/
│
├── app/
│   │
│   ├── main.py            ← FastAPI app factory, lifespan, middleware, route wiring
│   ├── config.py          ← Top-level config entry point (reads .env)
│   ├── database.py        ← Motor client, connect_db(), close_db(), get_db()
│   │
│   ├── routes/            ← PUBLIC route façades (canonical import path)
│   │   ├── __init__.py
│   │   ├── auth.py        ← /api/auth/*
│   │   ├── projects.py    ← /api/projects/*
│   │   ├── stories.py     ← /api/projects/{id}/stories/*
│   │   ├── characters.py  ← /api/projects/{id}/characters/*
│   │   └── ai.py          ← /api/granite/* (IBM Granite)
│   │
│   ├── routers/           ← Route implementations (business logic wiring)
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── stories.py
│   │   ├── characters.py
│   │   ├── worlds.py
│   │   ├── prompts.py
│   │   └── granite.py
│   │
│   ├── services/          ← Business logic layer
│   │   ├── ai_service.py        ← Domain-agnostic AI façade
│   │   ├── granite.py           ← IBM Granite async client (IAM, retry, SSE)
│   │   ├── project_service.py   ← Async Motor CRUD for projects
│   │   ├── story_service.py     ← Story CRUD + AI generation
│   │   ├── character_service.py ← Character CRUD + backstory generation
│   │   ├── world_service.py     ← World CRUD + concurrent lore generation
│   │   └── prompt_service.py    ← Prompt library + enhancement
│   │
│   ├── models/            ← Beanie ODM document models (MongoDB schema)
│   │   ├── user.py              ← users collection
│   │   ├── project.py           ← projects collection
│   │   ├── story.py             ← stories collection
│   │   ├── character.py         ← characters collection
│   │   ├── world.py             ← worlds collection
│   │   ├── asset.py             ← assets collection
│   │   ├── storyboard.py        ← storyboards + scenes collections
│   │   └── generated_asset.py   ← generated_assets collection (AI history)
│   │
│   ├── schemas/           ← Pydantic request / response models
│   │   ├── common.py            ← PaginatedResponse base
│   │   ├── auth.py              ← Register, Login, TokenPair, UserOut
│   │   ├── project.py           ← ProjectCreate, ProjectUpdate, ProjectOut
│   │   ├── story.py             ← StoryCreate, StoryOut, StoryGenerateRequest
│   │   ├── character.py         ← CharacterCreate, CharacterOut
│   │   ├── world.py             ← WorldCreate, WorldOut
│   │   ├── asset.py             ← AssetCreate, AssetOut
│   │   ├── prompt.py            ← PromptCreate, PromptOut
│   │   └── granite.py           ← GraniteGenerateRequest, ImagineRequest
│   │
│   ├── middleware/        ← Custom ASGI middleware
│   │   ├── logging_middleware.py ← Structured per-request timing logs
│   │   └── cors_middleware.py    ← CORS origin helper
│   │
│   ├── utils/             ← Shared utility helpers
│   │
│   └── core/              ← Internal framework utilities
│       ├── config.py            ← Pydantic Settings (source of truth)
│       ├── security.py          ← JWT creation/decoding, bcrypt
│       └── dependencies.py      ← FastAPI dependency functions
│
├── requirements.txt
├── .env.example
├── run.py                 ← Uvicorn convenience launcher
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API framework | **FastAPI 0.115+** | Async REST API, OpenAPI docs |
| Database driver | **Motor 3.6+** | Async MongoDB (no blocking I/O) |
| ODM | **Beanie 1.27+** | Document models, index creation |
| Validation | **Pydantic v2** | Request/response schemas |
| Config | **pydantic-settings** | `.env` loading, type coercion |
| Auth | **python-jose + passlib** | JWT (HS256), bcrypt password hashing |
| AI | **IBM Granite (Watsonx)** | Story, character, world generation |
| HTTP client | **httpx** | Async Watsonx API calls, SSE streaming |
| Server | **Uvicorn** | ASGI production server |

---

## Quick Start

### 1. Clone and install

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set MONGODB_URI and optionally WATSONX_API_KEY
```

### 3. Run the development server

```bash
python run.py
# or
uvicorn app.main:app --reload --port 8000
```

### 4. Open the API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc
- Health:      http://localhost:8000/health

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | **Yes** | — | MongoDB Atlas connection string |
| `DATABASE_NAME` | No | `lumora` | Database name inside the cluster |
| `JWT_SECRET` | **Yes** (prod) | `jwt-secret-change-me` | HMAC secret for JWT signing |
| `APP_SECRET_KEY` | **Yes** (prod) | `dev-secret-change-me` | App secret (sessions, CSRF) |
| `APP_CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `APP_ENV` | No | `development` | Deployment environment |
| `WATSONX_API_KEY` | No | — | IBM Watsonx API key — enables real AI |
| `WATSONX_PROJECT_ID` | No | — | IBM Watsonx project ID |
| `WATSONX_URL` | No | `https://us-south.ml.cloud.ibm.com` | Watsonx regional endpoint |
| `AI_MOCK_WHEN_UNCONFIGURED` | No | `true` | Return safe mocks when Watsonx not set |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## MongoDB Collections

Lumora AI uses six primary collections:

| Collection | Model file | Description |
|------------|-----------|-------------|
| `users` | `models/user.py` | Registered user accounts |
| `projects` | `models/project.py` | Creative projects (top-level container) |
| `stories` | `models/story.py` | Narrative text assets inside a project |
| `characters` | `models/character.py` | Character profiles inside a project |
| `worlds` | `models/world.py` | World-building documents |
| `assets` | `models/asset.py` | Uploaded / AI-generated digital assets |
| `storyboards` | `models/storyboard.py` | Visual scene boards (+ `scenes` sub-collection) |
| `generated_assets` | `models/generated_asset.py` | AI generation history log |

**Indexes** are created automatically by Beanie on first startup.

### Project document shape

```json
{
    "id":          "64f1a2b3c4d5e6f7a8b9c0d1",
    "title":       "The Last Kingdom",
    "description": "An epic fantasy saga set in a dying world.",
    "genre":       "Fantasy",
    "status":      "active",
    "created_at":  "2024-01-15T09:00:00Z",
    "updated_at":  "2024-01-20T14:30:00Z"
}
```

---

## API Reference

All endpoints are prefixed with `/api`.  Full interactive docs at `/docs`.

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness probe — returns `{status, database}` |

```json
{
    "status":   "healthy",
    "database": "connected"
}
```

### Auth  `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Create account → `TokenPair` |
| `POST` | `/login` | — | Sign in → `TokenPair` |
| `POST` | `/refresh` | — | Rotate access token |
| `POST` | `/logout` | Bearer | Revoke refresh token |
| `GET` | `/me` | Bearer | Get profile |
| `PATCH` | `/me` | Bearer | Update name / bio |

### Projects  `/api/projects`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/projects` | Bearer | List user projects (paginated) |
| `POST` | `/projects` | Bearer | Create project → `201` |
| `GET` | `/projects/{id}` | Bearer | Get single project |
| `PUT` | `/projects/{id}` | Bearer | Update project |
| `DELETE` | `/projects/{id}` | Bearer | Delete project → `204` |
| `GET` | `/projects/{id}/stats` | Bearer | Content statistics |

### Stories  `/api/projects/{id}/stories`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/projects/{pid}/stories` | Bearer | List stories |
| `POST` | `/projects/{pid}/stories` | Bearer | Create story |
| `GET` | `/projects/{pid}/stories/{id}` | Bearer | Get story |
| `PATCH` | `/projects/{pid}/stories/{id}` | Bearer | Update story |
| `DELETE` | `/projects/{pid}/stories/{id}` | Bearer | Delete story |
| `POST` | `/stories/generate` | Bearer | **AI story generation** |

### Characters  `/api/projects/{id}/characters`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/projects/{pid}/characters` | Bearer | List characters |
| `POST` | `/projects/{pid}/characters` | Bearer | Create character |
| `GET` | `/projects/{pid}/characters/{id}` | Bearer | Get character |
| `PATCH` | `/projects/{pid}/characters/{id}` | Bearer | Update character |
| `DELETE` | `/projects/{pid}/characters/{id}` | Bearer | Delete character |
| `POST` | `/characters/{id}/generate-backstory` | Bearer | **AI backstory** |

### IBM Granite AI  `/api/granite`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/granite/generate` | Bearer | Single-turn generation |
| `POST` | `/granite/generate/stream` | Bearer | Streaming SSE generation |
| `POST` | `/granite/imagine` | Bearer | Image generation (stub) |
| `GET` | `/granite/models` | Bearer | Available models |

---

## IBM Granite Integration

Lumora AI integrates with **IBM Watsonx** to power all AI features.

### Setup

1. Create an IBM Cloud account at https://cloud.ibm.com
2. Provision a **Watsonx.ai** service instance
3. Generate an API key from IAM
4. Create a project and copy the Project ID
5. Add to `.env`:

```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
```

### Available Models

| Model ID | Label | Use case |
|----------|-------|---------|
| `ibm/granite-13b-instruct-v2` | Granite 13B Instruct | Stories, characters, world lore |
| `ibm/granite-20b-code-instruct-v2` | Granite 20B Code | Code generation |
| `ibm/granite-vision-3-2-2b` | Granite Vision 3.2 | Image understanding |

### Mock Mode

When `WATSONX_API_KEY` is not set, all AI endpoints return safe mock responses.  
This keeps the frontend fully functional during development and offline demos.

Set `AI_MOCK_WHEN_UNCONFIGURED=false` to disable mock mode and require real credentials.

---

## Architecture Decisions

### Why Motor instead of pymongo?

Motor is the official async MongoDB driver.  Using synchronous pymongo in an async
FastAPI application would block the event loop, degrading throughput under concurrent
load.  Motor lets every database call be properly awaited.

### Why both `routes/` and `routers/`?

`routers/` contains the full route implementation (service calls, response mapping).  
`routes/` is the **public interface** — a thin re-export façade.  This pattern lets
you add route-level middleware, versioning (`/v2/`), or OpenAPI overrides without
touching business logic.

### Why Beanie on top of Motor?

Beanie adds:
- Type-safe document models via Pydantic
- Automatic index creation on startup
- Convenient `find()`, `save()`, `delete()` helpers

The raw Motor client (`get_db()`) is still available for complex aggregation queries
and bulk operations that don't need the ODM layer.

### Why is the health check non-fatal?

If MongoDB is unreachable at startup, the API still comes up.  The `/health` endpoint
reports `"database": "unreachable"` but the app remains alive.  This prevents a single
database blip from cascading into a complete service restart loop in container orchestrators.

---

## Development Guide

### Run tests

```bash
pytest -v
```

### Format and lint

```bash
ruff check app/
ruff format app/
```

### Add a new collection

1. Create `app/models/my_entity.py` with a `Document` subclass
2. Add it to `ALL_MODELS` in `app/models/__init__.py`
3. Create schemas in `app/schemas/my_entity.py`
4. Add service in `app/services/my_entity_service.py`
5. Add routes in `app/routers/my_entity.py`
6. Create a façade in `app/routes/my_entity.py`
7. Mount in `app/main.py`

### Future IBM Granite features

The `AIService` in `app/services/ai_service.py` is designed to be extended:

```python
# Add a new generation method
async def generate_scene_description(
    self,
    scene_title: str,
    mood: str,
    model: str | None = None,
) -> tuple[str, str]:
    prompt = f"Describe a scene titled '{scene_title}' with a {mood} mood..."
    return await self._client.generate(prompt=prompt, ...), model_used
```

---

## Licence

MIT — see `LICENSE` for details.

---

*Built for the IBM SkillsBuild Hackathon 2024 · Lumora AI Team*
