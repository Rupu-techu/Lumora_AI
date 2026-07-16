"""
app/routers/granite.py — Low-level IBM Granite AI endpoints.

Routes
------
POST /api/granite/generate        → GraniteGenerateResponse
POST /api/granite/generate/stream → SSE stream
POST /api/granite/imagine         → ImagineResponse
GET  /api/granite/models          → list of available models
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.dependencies import get_current_user
from app.schemas import GraniteGenerateRequest, GraniteGenerateResponse, ImagineRequest, ImagineResponse
from app.services.granite import GRANITE_CODE_MODEL, GRANITE_TEXT_MODEL, GRANITE_VISION_MODEL, get_granite_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/granite", tags=["granite"])

AVAILABLE_MODELS = [
    {"id": GRANITE_TEXT_MODEL,   "label": "Granite 13B Instruct",     "type": "text"},
    {"id": GRANITE_CODE_MODEL,   "label": "Granite 20B Code Instruct", "type": "code"},
    {"id": GRANITE_VISION_MODEL, "label": "Granite Vision 3.2 2B",    "type": "vision"},
]


@router.get("/models", summary="List available Granite models")
async def list_models(_: dict = Depends(get_current_user)):
    return {"models": AVAILABLE_MODELS}


@router.post(
    "/generate",
    response_model=GraniteGenerateResponse,
    summary="Single-turn text generation",
)
async def generate(
    payload: GraniteGenerateRequest,
    current_user: dict = Depends(get_current_user),
) -> GraniteGenerateResponse:
    client = get_granite_client()
    model_id = payload.model or GRANITE_TEXT_MODEL
    try:
        text = await client.generate(
            prompt=payload.prompt,
            model_id=model_id,
            max_new_tokens=payload.max_new_tokens,
            temperature=payload.temperature,
            top_p=payload.top_p,
        )
    except Exception as exc:
        logger.exception("Granite generate error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"IBM Watsonx error: {exc}",
        )
    return GraniteGenerateResponse(generated_text=text, model=model_id)


@router.post("/generate/stream", summary="Streaming text generation (SSE)")
async def generate_stream(
    payload: GraniteGenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    client   = get_granite_client()
    model_id = payload.model or GRANITE_TEXT_MODEL

    async def event_gen():
        try:
            async for chunk in client.stream_generate(
                prompt=payload.prompt,
                model_id=model_id,
                max_new_tokens=payload.max_new_tokens,
            ):
                yield f"data: {chunk}\n\n"
        except Exception as exc:
            logger.exception("Granite stream error: %s", exc)
            yield f"data: [ERROR] {exc}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/imagine", response_model=ImagineResponse, summary="Image generation (Granite Vision stub)")
async def imagine(
    payload: ImagineRequest,
    current_user: dict = Depends(get_current_user),
) -> ImagineResponse:
    client = get_granite_client()
    try:
        result = await client.imagine(prompt=payload.prompt)
    except Exception as exc:
        logger.exception("Granite imagine error: %s", exc)
        raise HTTPException(status_code=502, detail=f"IBM Watsonx error: {exc}")
    return ImagineResponse(**result)
