"""Plant identification router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from plant_identification.schemas import PlantIdentificationResponse
from plant_identification.service import identify_plant

router = APIRouter(prefix="/api/plant-identification", tags=["Plant Identification"])


@router.post("", response_model=PlantIdentificationResponse)
async def plant_identify(images: list[UploadFile] = File(...)):
    """Identify plant species from uploaded images."""
    try:
        image_bytes = await images[0].read()
        result = await identify_plant(image_bytes)
        return PlantIdentificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

