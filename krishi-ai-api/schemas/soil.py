"""Pydantic models for soil quality & location endpoints."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class SoilQualityRequest(BaseModel):
    N: float
    P: float
    K: float
    pH: float
    EC: float
    OC: float
    S: float
    Zn: float
    Fe: float
    Cu: float
    Mn: float
    B: float


class SoilQualityResponse(BaseModel):
    prediction: str


class LocationRequest(BaseModel):
    location: str


class LocationItem(BaseModel):
    name: str
    latitude: float
    longitude: float
    link: str


class LocationResponse(BaseModel):
    results: List[LocationItem]


class FertilizerRequest(BaseModel):
    Nitrogen: float
    Phosphorus: float
    Potassium: float
    Temperature: Optional[float] = None
    Humidity: Optional[float] = None
    ph: Optional[float] = None
    Rainfall: Optional[float] = None


class FertilizerResponse(BaseModel):
    Prediction: str

