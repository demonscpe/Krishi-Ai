"""Pydantic models for crop rotation."""
from pydantic import BaseModel, Field
from typing import Optional


class RotationRequest(BaseModel):
    Previous_Crop: str = Field(..., alias="Previous Crop")
    Soil_Type: str = Field(..., alias="Soil Type")
    Moisture_Level: float = Field(..., alias="Moisture Level")
    Nitrogen_N: float = Field(..., alias="Nitrogen (N)")
    Phosphorus_P: float = Field(..., alias="Phosphorus (P)")
    Potassium_K: float = Field(..., alias="Potassium (K)")


class RotationResponse(BaseModel):
    Recommended_Crop: str = Field(..., alias="Recommended Crop")

