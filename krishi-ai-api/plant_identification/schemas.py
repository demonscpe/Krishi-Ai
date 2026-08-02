"""Pydantic schemas for plant identification & disease detection."""
from pydantic import BaseModel, Field
from typing import Optional


class PlantIdentificationResponse(BaseModel):
    plant: str = Field(..., description="Identified plant species")
    confidence: Optional[float] = Field(None, ge=0, le=100, description="Confidence percentage")
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    family: Optional[str] = None
    description: Optional[str] = None
    health_status: Optional[str] = Field(None, description="Health status (Healthy/Diseased/Unknown)")
    disease: Optional[str] = Field(None, description="Detected disease name, if any")
    disease_confidence: Optional[float] = Field(None, ge=0, le=100, description="Disease confidence percentage")
    symptoms: Optional[str] = Field(None, description="Visible disease symptoms")
    remedy: Optional[str] = Field(None, description="Recommended treatment/remedy")
    source: Optional[str] = Field("AI", description="AI provider used")

