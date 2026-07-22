"""Pydantic schemas for disease severity."""
from pydantic import BaseModel, Field
from typing import Optional


class DiseaseSeverityRequest(BaseModel):
    disease: Optional[str] = Field(None, description="Detected disease name")
    plant: Optional[str] = Field(None, description="Plant/crop type")


class DiseaseSeverityResponse(BaseModel):
    severity: str = Field(..., description="Low, Medium, or High")
    affected_area_percent: float = Field(..., ge=0, le=100, description="Estimated affected area %")
    risk_level: str = Field(..., description="Low, Medium, or High")
    recommendation: str = Field(..., description="Action recommendation")
    annotated_image_base64: Optional[str] = None

