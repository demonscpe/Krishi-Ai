"""Treatment recommendation router."""
from fastapi import APIRouter, HTTPException
from treatment_recommendation.schemas import TreatmentRequest, TreatmentResponse
from treatment_recommendation.service import get_treatment

router = APIRouter(prefix="/api/treatment-recommendation", tags=["Treatment Recommendation"])


@router.post("", response_model=TreatmentResponse)
async def treatment_recommend(data: TreatmentRequest):
    """Get treatment recommendation for a plant disease."""
    try:
        result = await get_treatment(data.plant, data.disease)
        return TreatmentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

