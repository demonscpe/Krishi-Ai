"""Pydantic schemas for crop rotation recommendation."""
from pydantic import BaseModel, Field
from typing import Optional


class RotationRequest(BaseModel):
    previous_crop: str = Field(..., alias="Previous Crop", description="e.g. Rice, Wheat, Maize")
    soil_type: str = Field(..., alias="Soil Type", description="Loamy | Clayey | Sandy | Saline")
    moisture_level: float = Field(..., alias="Moisture Level", ge=0, le=100)
    nitrogen: float = Field(..., alias="Nitrogen (N)", ge=0)
    phosphorus: float = Field(..., alias="Phosphorus (P)", ge=0)
    potassium: float = Field(..., alias="Potassium (K)", ge=0)

    model_config = {"populate_by_name": True}


class RotationResponse(BaseModel):
    recommended_crop: str
    reason: Optional[str] = None
