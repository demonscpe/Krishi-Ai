"""Fertilizer Recommendation router."""
from fastapi import APIRouter, HTTPException
from fertilizer_recommendation.schemas import FertilizerRecommendationResponse, FertilizerItem, ScheduleItem
from fertilizer_recommendation.service import get_recommendations

router = APIRouter(tags=["Fertilizer Recommendation"], prefix="/api/fertilizer-recommendation")


@router.post("", response_model=FertilizerRecommendationResponse)
async def fertilizer_recommend():
    """Generate fertilizer recommendations based on latest soil test values.
    
    Returns a list of recommended fertilizers with quantities per acre,
    application schedule, and soil context summary.
    """
    try:
        result = get_recommendations()
        
        return FertilizerRecommendationResponse(
            crop=result.get("crop"),
            fertilizers=[FertilizerItem(**f) for f in result.get("fertilizers", [])],
            schedule=[ScheduleItem(**s) for s in (result.get("schedule") or [])],
            soil_summary=result.get("soil_summary"),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

