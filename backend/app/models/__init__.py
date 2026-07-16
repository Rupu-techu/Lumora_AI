"""
app/models — Beanie ODM document models for MongoDB.

Collections
-----------
  users             — registered accounts
  projects          — creative projects
  stories           — narrative text assets
  characters        — character entities
  worlds            — world-building documents
  assets            — uploaded / AI-generated digital assets
  storyboards       — visual scene boards
  scenes            — individual storyboard cards
  generated_assets  — AI generation history log

Each module exports a single Document subclass.  Import the full list
``ALL_MODELS`` when initialising Beanie so every collection is registered.
"""

from app.models.asset import Asset
from app.models.character import Character
from app.models.generated_asset import GeneratedAsset
from app.models.project import Project
from app.models.story import Story
from app.models.storyboard import Scene, Storyboard
from app.models.user import User
from app.models.world import World

__all__ = [
    "User",
    "Project",
    "Story",
    "Character",
    "World",
    "Asset",
    "Storyboard",
    "Scene",
    "GeneratedAsset",
]

# Passed directly to beanie.init_beanie(document_models=ALL_MODELS)
ALL_MODELS: list = [
    User,
    Project,
    Story,
    Character,
    World,
    Asset,
    Storyboard,
    GeneratedAsset,
]
