"""Crop identification router — accepts image upload, returns crop name + confidence."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from cropidentification.schemas import IdentificationResult
from cropidentification.service import identify_from_image

router = APIRouter(prefix="/api/cropidentification", tags=["Crop Identification"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.post("/identify", response_model=IdentificationResult)
async def identify_crop(image: UploadFile = File(..., description="Crop image (JPG/PNG/WEBP, max 10MB)")):
    """Identify a crop from an uploaded image using AI vision."""
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {image.content_type}. Use JPG, PNG, or WEBP.")

    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image too large. Max size is {MAX_SIZE_MB}MB.")

    try:
        result = await identify_from_image(image_bytes, image.filename or "image.jpg")
        return IdentificationResult(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
