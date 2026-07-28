"""Pydantic schemas for disease prevention."""
from pydantic import BaseModel, Field, model_validator
from typing import List, Optional


class DiseasePreventionRequest(BaseModel):
    plant: Optional[str] = Field(None, description="Plant/crop type")
    crop: Optional[str] = Field(None, description="Crop (alias for plant)")
    disease: Optional[str] = Field(None, description="Disease name")
    season: Optional[str] = None
    region: Optional[str] = None

    @model_validator(mode="after")
    def resolve_plant(self):
        if not self.plant and self.crop:
            self.plant = self.crop
        if not self.plant:
            self.plant = "unknown"
        if not self.disease:
            self.disease = "general"
        return self



class DiseasePreventionResponse(BaseModel):
    causes: List[str] = Field(..., description="Possible causes of the disease")
    prevention_steps: List[str] = Field(..., description="Recommended prevention steps")
    seasonal_precautions: List[str] = Field(default=[], description="Season-specific precautions")
    crop_rotation_advice: Optional[str] = None
    irrigation_recommendations: Optional[str] = None

