"""Plant identification router — identify plant species and detect diseases from images."""
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File
from plant_identification.schemas import PlantIdentificationResponse
from plant_identification.service import identify_plant

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/plant-identification", tags=["Plant Identification"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.post("", response_model=PlantIdentificationResponse)
async def plant_identify(images: list[UploadFile] = File(...)):
    """Identify plant species and detect disease from uploaded image(s)."""
    if not images:
        raise HTTPException(status_code=400, detail="Please upload at least one image.")

    image = images[0]
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {image.content_type}. Use JPG, PNG, or WEBP.",
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Image too large. Max size is {MAX_SIZE_MB}MB.")

    try:
        result = await identify_plant(image_bytes, image.filename or "image.jpg")
        return PlantIdentificationResponse(**result)
    except Exception as e:
        logger.exception("Plant identification failed")
        raise HTTPException(status_code=500, detail=str(e))

