"""3-year crop rotation plan router."""
from fastapi import APIRouter, HTTPException
from croprotationplan.schemas import RotationPlanRequest, RotationPlanResponse
from croprotationplan.service import build_plan

router = APIRouter(prefix="/api/croprotationplan", tags=["Crop Rotation Plan"])


@router.post("/generate", response_model=RotationPlanResponse)
async def generate_plan(data: RotationPlanRequest):
    """Generate a full 3-year crop rotation plan with soil health, nutrient balance, and financial projections."""
    try:
        result = build_plan(data.model_dump())
        return RotationPlanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
