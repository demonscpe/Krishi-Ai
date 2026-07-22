"""Soil Health Analyzer router."""
from fastapi import APIRouter, HTTPException
from soil_health_analyzer.schemas import SoilHealthResponse
from soil_health_analyzer.service import analyze_soil_health

router = APIRouter(tags=["Soil Health Analyzer"], prefix="/api/soil-health")


@router.post("", response_model=SoilHealthResponse)
async def soil_health_analyze():
    """Analyze soil health using the latest saved soil test values.
    
    Returns a health score (0-100), high-level summary, and per-nutrient breakdown
    with status, reasons, and recommendations.
    """
    try:
        result = analyze_soil_health()
        return SoilHealthResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

