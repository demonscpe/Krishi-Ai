"""Pydantic schemas for disease prevention."""
from pydantic import BaseModel, Field
from typing import List, Optional


class DiseasePreventionRequest(BaseModel):
    plant: str = Field(..., description="Plant/crop type")
    disease: str = Field(..., description="Disease name")


class DiseasePreventionResponse(BaseModel):
    causes: List[str] = Field(..., description="Possible causes of the disease")
    prevention_steps: List[str] = Field(..., description="Recommended prevention steps")
    seasonal_precautions: List[str] = Field(default=[], description="Season-specific precautions")
    crop_rotation_advice: Optional[str] = None
    irrigation_recommendations: Optional[str] = None

