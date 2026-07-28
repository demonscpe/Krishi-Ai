"""Pydantic schemas for treatment recommendation."""
from pydantic import BaseModel, Field, model_validator
from typing import Optional


class TreatmentRequest(BaseModel):
    plant: Optional[str] = Field(None, description="Plant/crop type")
    crop: Optional[str] = Field(None, description="Crop (alias for plant)")
    disease: str = Field(..., description="Disease name")
    severity: Optional[str] = None

    @model_validator(mode="after")
    def resolve_plant(self):
        if not self.plant and self.crop:
            self.plant = self.crop
        if not self.plant:
            self.plant = "unknown"
        return self



class TreatmentResponse(BaseModel):
    plant: str
    disease: str
    chemical_treatment: str
    organic_method: str
    spray_frequency: str
    remove_infected_leaves: str
    estimated_recovery_days: str
    dosage: Optional[str] = None

