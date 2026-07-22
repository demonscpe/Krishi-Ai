"""Pydantic schemas for soil analysis."""
from pydantic import BaseModel, Field
from typing import Optional


class SoilAnalysisRequest(BaseModel):
    soil_type: str = Field(..., description="Loamy | Clayey | Sandy | Saline")
    N: float = Field(..., ge=0, description="Nitrogen (kg/ha)")
    P: float = Field(..., ge=0, description="Phosphorus (kg/ha)")
    K: float = Field(..., ge=0, description="Potassium (kg/ha)")
    pH: float = Field(..., ge=0, le=14)
    EC: float = Field(..., ge=0, description="Electrical Conductivity (dS/m)")
    OC: float = Field(..., ge=0, description="Organic Carbon (%)")
    S: float = Field(..., ge=0, description="Sulphur (ppm)")
    Zn: float = Field(..., ge=0, description="Zinc (ppm)")
    Fe: float = Field(..., ge=0, description="Iron (ppm)")
    Cu: float = Field(..., ge=0, description="Copper (ppm)")
    Mn: float = Field(..., ge=0, description="Manganese (ppm)")
    B: float = Field(..., ge=0, description="Boron (ppm)")


class SoilAnalysisResponse(BaseModel):
    soil_quality: str
    fertility_score: float
    recommendations: list[str]
    suitable_crops: list[str]
