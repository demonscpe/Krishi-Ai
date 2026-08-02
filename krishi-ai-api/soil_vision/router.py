"""Soil Vision router.

Endpoints:
  POST /api/soil-vision/analyze  — Upload a soil image + mode for AI vision analysis
  POST /api/soil-vision/chat     — Chat with the soil assistant for a given mode
"""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from soil_vision.schemas import (
    SoilVisionAnalyzeResponse,
    SoilVisionChatRequest,
    SoilVisionChatResponse,
)
from soil_vision.service import analyze_soil_image, chat_with_soil_assistant

router = APIRouter(tags=["Soil Vision"], prefix="/api/soil-vision")


@router.post("/analyze", response_model=SoilVisionAnalyzeResponse)
async def soil_vision_analyze(
    mode: str = Form(default="detection", description="detection|health_analysis|health_rating|visual_analysis"),
    image: UploadFile = File(...),
):
    """Analyze a soil image using OpenRouter vision.

    Accepts an image upload (PNG/JPG/JPEG) and a mode string, then returns the
    AI vision analysis result for that mode.
    """
    try:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, JPEG).")

        contents = await image.read()
        return analyze_soil_image(contents, mode)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/chat", response_model=SoilVisionChatResponse)
async def soil_vision_chat(request: SoilVisionChatRequest):
    """Chat with the soil assistant for the given mode."""
    try:
        return chat_with_soil_assistant(request.mode, request.message, request.context)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

