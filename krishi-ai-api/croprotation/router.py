"""Crop rotation recommendation router."""
from fastapi import APIRouter, HTTPException
from croprotation.schemas import RotationRequest, RotationResponse
from croprotation.service import recommend

router = APIRouter(prefix="/api/croprotation", tags=["Crop Rotation"])


@router.post("/recommend", response_model=RotationResponse)
async def rotation_recommend(data: RotationRequest):
    """Recommend next crop based on previous crop and soil data."""
    try:
        result = recommend(data.model_dump(by_alias=True))
        return RotationResponse(
            recommended_crop=result["Recommended Crop"],
            reason=result["reason"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
