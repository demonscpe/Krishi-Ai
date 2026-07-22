"""Disease detection router."""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from disease_detection_new.schemas import DiseaseDetectionResponse
from disease_detection_new.service import detect_disease

router = APIRouter(prefix="/api/disease-detection", tags=["Disease Detection"])


@router.post("", response_model=DiseaseDetectionResponse)
async def disease_detection(
    image: UploadFile = File(...),
    plant: str = Form(...),
):
    """Detect disease from an uploaded plant image."""
    try:
        image_bytes = await image.read()
        result = await detect_disease(image_bytes, plant)
        return DiseaseDetectionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
