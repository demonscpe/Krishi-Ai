"""Pydantic schemas for plant identification."""
from pydantic import BaseModel, Field
from typing import Optional


class PlantIdentificationResponse(BaseModel):
    plant: str = Field(..., description="Identified plant species")
    confidence: float = Field(..., ge=0, le=100, description="Confidence percentage")
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    description: Optional[str] = None

