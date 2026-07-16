"""
app/routes/auth.py — Authentication route façade.

Exposes the auth router under the canonical ``app/routes/`` path.

Routes (mounted at /api in main.py)
------------------------------------
POST   /api/auth/register   — create account → TokenPair (201)
POST   /api/auth/login      — sign in        → TokenPair
POST   /api/auth/refresh    — rotate token   → TokenResponse
POST   /api/auth/logout     — revoke token   → 200
GET    /api/auth/me         — get profile    → UserOut
PATCH  /api/auth/me         — update profile → UserOut

Implementation
--------------
Full logic lives in ``app/routers/auth.py``.  This file is a thin re-export
so ``main.py`` can import from ``app.routes`` consistently.
"""

from app.routers.auth import router  # re-export

__all__ = ["router"]
