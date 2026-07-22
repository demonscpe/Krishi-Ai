"""Pydantic schemas for disease detection."""
from pydantic import BaseModel, Field
from typing import Optional


class DiseaseDetectionResponse(BaseModel):
    disease: str = Field(..., description="Detected disease name")
    status: str = Field(..., description="Disease status (Healthy/Diseased)")
    confidence: Optional[float] = Field(None, ge=0, le=100, description="Confidence percentage")
    plant: Optional[str] = Field(None, description="Plant/crop type")
    description: Optional[str] = Field(None, description="Brief disease description")
