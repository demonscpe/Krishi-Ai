"""Pydantic schemas for Soil Test Input module."""
from pydantic import BaseModel, Field
from typing import Optional


class SoilTestRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=500, description="Nitrogen (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=300, description="Phosphorus (kg/ha)")
    potassium: float = Field(..., ge=0, le=500, description="Potassium (kg/ha)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level")
    organic_carbon: float = Field(..., ge=0, le=10, description="Organic Carbon (%)")
    ec: float = Field(..., ge=0, le=10, description="Electrical Conductivity (dS/m)")


class SoilTestResponse(BaseModel):
    id: Optional[int] = None
    message: str = "Soil test values saved successfully."
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    organic_carbon: float
    ec: float


class OcrResponse(BaseModel):
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = None
    organic_carbon: Optional[float] = None
    ec: Optional[float] = None
    parsed_fields: int = Field(..., description="Number of fields successfully parsed")
    message: str = "OCR extraction completed. Review auto-filled values before submitting."

