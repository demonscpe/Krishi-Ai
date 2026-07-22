"""Pydantic models for crop prediction & recommendation endpoints."""
from pydantic import BaseModel, Field
from typing import Optional, List, Union


class CropPredictRequest(BaseModel):
    category: str = Field("field_crops", description="Crop category: field_crops, vegetables, flowers")
    Nitrogen: float = Field(..., ge=0, description="Nitrogen in kg/ha")
    Phosphorus: float = Field(..., ge=0, description="Phosphorus in kg/ha")
    Potassium: float = Field(..., ge=0, description="Potassium in kg/ha")
    Temperature: float = Field(..., ge=-50, le=60, description="Temperature in °C")
    Humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    Rainfall: float = Field(..., ge=0, description="Rainfall in mm")

    # Extra fields for compatibility with rotation & recommendation endpoints
    Nitrogen_N: Optional[float] = Field(None, alias="Nitrogen (N)")
    Phosphorus_P: Optional[float] = Field(None, alias="Phosphorus (P)")
    Potassium_K: Optional[float] = Field(None, alias="Potassium (K)")
    Soil_Type: Optional[str] = Field(None, alias="Soil Type")
    Previous_Crop: Optional[str] = Field(None, alias="Previous Crop")
    Moisture_Level: Optional[float] = Field(None, alias="Moisture Level")


class AlternativeCrop(BaseModel):
    crop: str
    confidence: float


class CropPredictResponse(BaseModel):
    Prediction: str
    Confidence: Optional[float] = None
    Alternatives: List[AlternativeCrop] = []
    AIInsight: Optional[str] = None
    Category: str
    Source: str = "ML"


class CropRecommendRequest(BaseModel):
    Previous_Crop: str = Field(..., alias="Previous Crop")
    Soil_Type: str = Field(..., alias="Soil Type")
    Moisture_Level: float = Field(..., alias="Moisture Level")
    Nitrogen_N: float = Field(..., alias="Nitrogen (N)")
    Phosphorus_P: float = Field(..., alias="Phosphorus (P)")
    Potassium_K: float = Field(..., alias="Potassium (K)")


class CropRecommendResponse(BaseModel):
    Recommended_Crop: str = Field(..., alias="Recommended Crop")

