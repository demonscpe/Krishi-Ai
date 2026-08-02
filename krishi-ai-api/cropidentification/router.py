"""Crop identification router — accepts image upload for identification and chat for farming advice."""
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from cropidentification.schemas import (
    IdentificationResult,
    ChatRequest,
    ChatResponse,
    HealthResponse,
)
from cropidentification.service import identify_from_image, get_chat_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cropidentification", tags=["Crop Identification"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse()


@router.post("/identify", response_model=IdentificationResult)
async def identify_crop(image: UploadFile = File(..., description="Crop image (JPG/PNG/WEBP, max 10MB)")):
    """Identify a crop from an uploaded image using AI vision."""
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {image.content_type}. Use JPG, PNG, or WEBP.",
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Max size is {MAX_SIZE_MB}MB.",
        )

    try:
        result = await identify_from_image(image_bytes, image.filename or "image.jpg")
        return IdentificationResult(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Crop identification failed unexpectedly")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Get farming advice related to a crop or general agriculture."""
    try:
        reply = await get_chat_response(request.message, request.crop_context)
        return ChatResponse(reply=reply, source="AI")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Crop chat failed unexpectedly")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
