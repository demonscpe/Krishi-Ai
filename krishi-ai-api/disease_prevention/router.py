"""Disease prevention router."""
from fastapi import APIRouter, HTTPException
from disease_prevention.schemas import DiseasePreventionRequest, DiseasePreventionResponse
from disease_prevention.service import get_prevention

router = APIRouter(prefix="/api/disease-prevention", tags=["Disease Prevention"])


@router.post("", response_model=DiseasePreventionResponse)
async def prevention_guide(data: DiseasePreventionRequest):
    """Get prevention guide for a specific plant and disease."""
    try:
        result = await get_prevention(data.plant, data.disease)
        return DiseasePreventionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

