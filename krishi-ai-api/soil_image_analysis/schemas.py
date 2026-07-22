"""Pydantic schemas for Soil Image Analysis module."""
from pydantic import BaseModel, Field
from typing import Optional


class SoilImageAnalysisResponse(BaseModel):
    soil_type: str = Field(..., description="Predicted soil type: Black, Red, Sandy, Clay, Loamy, Alluvial")
    color: str = Field(..., description="Soil color: Dark Brown, Reddish, Yellowish, Grey, Black")
    texture: str = Field(..., description="Soil texture: Sandy, Silty, Clayey, Loamy")
    condition: str = Field(..., description="Surface condition: Dry, Moist, Wet, Cracked, Eroded")
    confidence: Optional[float] = Field(None, description="Overall confidence percentage")

