"""Disease severity router."""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from disease_severity.schemas import DiseaseSeverityResponse
from disease_severity.service import assess_severity

router = APIRouter(prefix="/api/disease-severity", tags=["Disease Severity"])


@router.post("", response_model=DiseaseSeverityResponse)
async def severity_assess(
    image: UploadFile = File(...),
    disease: Optional[str] = Form(None),
    plant: Optional[str] = Form(None),
):
    """Assess disease severity from an uploaded plant image."""
    try:
        image_bytes = await image.read()
        result = await assess_severity(image_bytes, disease, plant)
        return DiseaseSeverityResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

