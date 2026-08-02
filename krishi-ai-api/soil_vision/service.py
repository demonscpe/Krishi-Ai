"""Soil Vision service.

Consolidates the 4 standalone soil vision apps into the unified Krishi-AI backend.
Uses OpenRouter vision models (via the shared openrouter_client) for image analysis
and a text model for the soil assistant chat, matching the standalone app prompts.
"""
import base64
import io
import logging

from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError

from services.openrouter_client import get_client

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 10 * 1024 * 1024
VISION_MODEL = "google/gemini-2.5-flash"
TEXT_MODEL = "google/gemini-2.5-flash"

# Mode-specific vision prompts (ported from the 4 standalone soil apps)
VISION_PROMPTS = {
    "detection": (
        "You are a professional soil classifier and mineralogist. Analyze this soil image and detect its "
        "classification (sandy, loam, clay, silt, chalky, peaty). Describe its physical texture, mineral "
        "properties, water drainage capability, compaction risk, and the list of crops that thrive in this "
        "specific soil type. If the image is not soil, say so plainly."
    ),
    "health_analysis": (
        "You are an expert soil scientist and agricultural agronomist. Analyze this soil image and determine "
        "its characteristics. Give the soil type (e.g., clay, sandy, loamy, silty, chalky, peaty), visible "
        "color and texture characteristics, estimated soil health/structure, confidence level, suitability for "
        "common crops, and a short next step for testing or improvement. If the image does not show soil or is "
        "unclear, say so plainly."
    ),
    "health_rating": (
        "You are an expert soil health specialist and agricultural agronomist. Analyze this soil image and "
        "assess its health. Provide a breakdown of its visible structure (e.g. granular, blocky, platy), "
        "organic matter indicators (based on coloration and residues), compaction signs, and biological "
        "indicators. Provide a final Soil Health Rating (Excellent/Good/Fair/Poor), and detailed organic "
        "management recommendations (compost, mulching, cover crops) to improve fertility. If the image does "
        "not show soil or is unclear, say so plainly."
    ),
    "visual_analysis": (
        "You are an agricultural soil analyst. Perform a visual soil analysis of this image. Identify color "
        "(Munsell color system estimation if possible), texture/aggregate structure (blocky, granular, crummy, "
        "platey), moisture estimation (dry, moist, saturated), erosion risk, and tillage recommendations. If "
        "the image does not show soil or is unclear, say so plainly."
    ),
}

# Mode-specific system prompts for the soil assistant chat
CHAT_SYSTEM_PROMPTS = {
    "detection": (
        "You are a soil detection and classification specialist. Give advice on managing specific soil types, "
        "improving drainage of clay, increasing water retention of sand, fertilizing peat/chalk, and crop "
        "suitability for the identified soil type. Suggest standard soil practices first."
    ),
    "health_analysis": (
        "You are a professional soil health and agricultural land advisor. Provide concise, cautious guidance "
        "on soil management, organic fertilizers, compost, cover crops, soil pH adjustments, and crop "
        "suitability based on the soil context. Suggest organic and sustainable practices first. Mention when "
        "professional laboratory soil testing is recommended."
    ),
    "health_rating": (
        "You are a professional soil health and agricultural land advisor. Provide concise, cautious guidance "
        "on soil management, organic fertilizers, compost, cover crops, soil pH adjustments, and crop "
        "suitability based on the soil context. Suggest organic and sustainable practices first. Mention when "
        "professional laboratory soil testing is recommended."
    ),
    "visual_analysis": (
        "You are a professional soil image analysis advisor. Provide guidance based on visual soil traits like "
        "compaction, erosion signs, texture, aggregate size, crusting, and moisture indicators. Recommend "
        "sustainable management techniques."
    ),
}

VALID_MODES = set(VISION_PROMPTS.keys())

DEFAULT_CONTEXTS = {
    "detection": "No soil classification has been performed yet.",
    "health_analysis": "No soil health analysis has been performed yet.",
    "health_rating": "No soil health analysis has been performed yet.",
    "visual_analysis": "No soil image analysis has been performed yet.",
}


def _validate_mode(mode: str) -> str:
    """Validate the requested vision mode and return the normalized key."""
    if mode not in VALID_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode '{mode}'. Must be one of: {', '.join(sorted(VALID_MODES))}",
        )
    return mode


def normalise_image(image_bytes: bytes) -> str:
    """Validate the image and return a base64 JPEG data payload."""
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Please choose an image.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            image.verify()
        with Image.open(io.BytesIO(image_bytes)) as image:
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="JPEG", quality=90)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.") from exc
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def analyze_soil_image(image_bytes: bytes, mode: str = "detection") -> dict:
    """Analyze a soil image using OpenRouter vision model."""
    mode = _validate_mode(mode)
    client = get_client()
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is not configured on the server.",
        )

    image_base64 = normalise_image(image_bytes)
    prompt = VISION_PROMPTS[mode]

    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}},
                ],
            }],
            max_tokens=600,
        )
        result = response.choices[0].message.content
    except Exception as exc:
        logger.exception("OpenRouter vision request failed")
        raise HTTPException(status_code=502, detail=f"OpenRouter request failed: {exc}") from exc

    if not result:
        raise HTTPException(status_code=502, detail="The AI service returned an empty response.")

    return {"mode": mode, "result": result}


def chat_with_soil_assistant(mode: str, message: str, context: str = "") -> dict:
    """Chat with the soil assistant using the OpenRouter text model."""
    mode = _validate_mode(mode)
    client = get_client()
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY is not configured on the server.",
        )

    soil_context = context or DEFAULT_CONTEXTS[mode]

    try:
        response = client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": CHAT_SYSTEM_PROMPTS[mode]},
                {"role": "user", "content": f"Soil context:\n{soil_context}\n\nQuestion:\n{message}"},
            ],
            max_tokens=800,
        )
        result = response.choices[0].message.content
    except Exception as exc:
        logger.exception("OpenRouter chat request failed")
        raise HTTPException(status_code=502, detail=f"OpenRouter request failed: {exc}") from exc

    if not result:
        raise HTTPException(status_code=502, detail="The AI service returned an empty response.")

    return {"reply": result}

