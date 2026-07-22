"""Location-based services router (OpenAI-powered)."""
from fastapi import APIRouter, HTTPException
from schemas.soil import LocationRequest
from services.openai_client import get_openai_response

router = APIRouter(tags=["Location"], prefix="/api")


@router.post("/soil-labs")
async def find_soil_labs(data: LocationRequest):
    """Find nearby soil testing labs using AI."""
    result, error = await get_openai_response(data.location, prompt_type="soil")
    if error:
        raise HTTPException(status_code=500, detail=error)
    return result


@router.post("/ee-shops")
async def find_ee_shops(data: LocationRequest):
    """Find nearby electrical and electronics shops using AI."""
    result, error = await get_openai_response(data.location, prompt_type="ee")
    if error:
        raise HTTPException(status_code=500, detail=error)
    return result

