"""Pydantic schemas for treatment recommendation."""
from pydantic import BaseModel, Field
from typing import Optional


class TreatmentRequest(BaseModel):
    plant: str = Field(..., description="Plant/crop type")
    disease: str = Field(..., description="Disease name")


class TreatmentResponse(BaseModel):
    plant: str
    disease: str
    chemical_treatment: str
    organic_method: str
    spray_frequency: str
    remove_infected_leaves: str
    estimated_recovery_days: str
    dosage: Optional[str] = None

