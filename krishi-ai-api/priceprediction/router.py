"""Price prediction router."""
from fastapi import APIRouter, HTTPException
from priceprediction.schemas import PriceRequest
from priceprediction.service import get_overview, get_detail, list_commodities

router = APIRouter(prefix="/api/priceprediction", tags=["Price Prediction"])


@router.get("/overview")
async def price_overview():
    """Market price overview — top gainers, losers, 6-month forecast."""
    try:
        return await get_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detail")
async def price_detail(data: PriceRequest):
    """Detailed 12-month price forecast for a single commodity."""
    try:
        return await get_detail(data.crop_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/commodities")
async def commodities():
    """List all supported commodity names."""
    return {"commodities": list_commodities()}
