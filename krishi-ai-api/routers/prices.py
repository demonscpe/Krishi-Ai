"""Price prediction router."""
from fastapi import APIRouter, HTTPException
from schemas.prices import PriceOverviewResponse, CommodityRequest, CommodityForecast
from services.price_engine import get_price_overview, get_commodity_detail

router = APIRouter(tags=["Prices"], prefix="/api/prices")


@router.get("/overview")
async def price_overview():
    """Get market price overview with top gainers, losers, and 6-month forecast."""
    try:
        result = await get_price_overview()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/commodity")
async def commodity_detail(data: CommodityRequest):
    """Get detailed price forecast for a specific commodity."""
    try:
        result = await get_commodity_detail(data.cropName)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

