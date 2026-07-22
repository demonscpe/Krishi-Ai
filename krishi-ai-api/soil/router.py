"""Soil analysis router."""
from fastapi import APIRouter, HTTPException
from soil.schemas import SoilAnalysisRequest, SoilAnalysisResponse
from soil.service import analyze

router = APIRouter(prefix="/api/soil", tags=["Soil Analysis"])


@router.post("/analyze", response_model=SoilAnalysisResponse)
async def soil_analyze(data: SoilAnalysisRequest):
    """Analyze soil quality and get crop recommendations."""
    try:
        result = analyze(data.model_dump())
        return SoilAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
