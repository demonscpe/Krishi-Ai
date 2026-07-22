"""Pydantic models for price prediction endpoints."""
from pydantic import BaseModel, Field
from typing import List, Optional, Any


class PriceEntry(BaseModel):
    """[crop_name, price, change_pct]"""
    crop: str
    price: float
    change_percent: float


class ForecastEntry(BaseModel):
    """[month, price, change_pct]"""
    month: str
    price: float
    change_percent: float


class CommodityForecast(BaseModel):
    max_crop: List[Any]
    min_crop: List[Any]
    forecast_values: List[List[Any]]
    forecast_x: List[str]
    forecast_y: List[float]
    previous_values: List[List[Any]]
    previous_x: List[str]
    previous_y: List[float]
    current_price: float
    image_url: str
    prime_loc: str
    type_c: str
    export: str
    name: str


class PriceOverviewResponse(BaseModel):
    top_gainers: List[PriceEntry]
    top_losers: List[PriceEntry]
    six_months_forecast: List[Any]
    commodities: List[str]
    chunks: List[List[str]]


class CommodityRequest(BaseModel):
    cropName: str

