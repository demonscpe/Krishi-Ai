"""Pydantic schemas for price prediction."""
from pydantic import BaseModel, Field
from typing import List, Optional


class PriceRequest(BaseModel):
    crop_name: str = Field(..., description="Commodity name e.g. wheat, rice, maize")


class MonthlyPrice(BaseModel):
    month: str
    price: float
    change_pct: Optional[float] = None


class PriceDetailResponse(BaseModel):
    name: str
    current_price: float
    forecast: List[MonthlyPrice]
    previous: List[MonthlyPrice]
    prime_location: str
    season: str
    export_countries: str
    max_forecast: MonthlyPrice
    min_forecast: MonthlyPrice


class GainerLoser(BaseModel):
    name: str
    price: float
    change_pct: float


class OverviewResponse(BaseModel):
    top_gainers: List[GainerLoser]
    top_losers: List[GainerLoser]
    commodities: List[str]
