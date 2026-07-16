"""
app/routers/auth.py — Authentication endpoints.

Routes
------
POST /api/auth/register   → TokenPair
POST /api/auth/login      → TokenPair
POST /api/auth/refresh    → TokenResponse (new access token)
POST /api/auth/logout     → 204
GET  /api/auth/me         → UserOut
PATCH /api/auth/me        → UserOut
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

import app.db as db
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    revoke_refresh_token,
    verify_password,
)
from app.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    TokenResponse,
    UserOut,
    UserUpdateRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_out(user: dict) -> UserOut:
    return UserOut(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        bio=user.get("bio"),
        avatar_url=user.get("avatar_url"),
        created_at=user["created_at"],
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new account",
)
async def register(payload: RegisterRequest) -> TokenPair:
    if db.get_user_by_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = db.create_user(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    return TokenPair(
        access_token=create_access_token(user["id"]),
        refresh_token=create_refresh_token(user["id"]),
    )


@router.post("/login", response_model=TokenPair, summary="Sign in and receive tokens")
async def login(payload: LoginRequest) -> TokenPair:
    user = db.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return TokenPair(
        access_token=create_access_token(user["id"]),
        refresh_token=create_refresh_token(user["id"]),
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
async def refresh(payload: RefreshRequest) -> TokenResponse:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
    )
    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except Exception:
        raise exc

    user = db.get_user_by_id(user_id)
    if user is None:
        raise exc

    return TokenResponse(access_token=create_access_token(user_id))


@router.post("/logout", status_code=status.HTTP_200_OK, summary="Revoke refresh token")
async def logout(payload: RefreshRequest) -> dict:
    """
    Stateless JWT logout.  The client must also discard the access token.
    The refresh token is added to the server-side blacklist.
    """
    try:
        revoke_refresh_token(payload.refresh_token)
    except Exception:
        pass   # Silently ignore invalid tokens on logout
    return {"detail": "Logged out."}


@router.get("/me", response_model=UserOut, summary="Get current user profile")
async def get_me(current_user: dict = Depends(get_current_user)) -> UserOut:
    return _user_out(current_user)


@router.patch("/me", response_model=UserOut, summary="Update name or bio")
async def update_me(
    payload: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
) -> UserOut:
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = db.update_user(current_user["id"], **updates)
    if updated is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return _user_out(updated)
