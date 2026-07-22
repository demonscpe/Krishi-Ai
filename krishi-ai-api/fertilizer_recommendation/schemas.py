"""Pydantic schemas for Fertilizer Recommendation module."""
from pydantic import BaseModel, Field
from typing import List, Optional


class FertilizerItem(BaseModel):
    name: str = Field(..., description="Fertilizer name")
    quantity_per_acre: str = Field(..., description="Recommended quantity per acre")
    type: Optional[str] = Field(None, description="Fertilizer type: Chemical, Organic, Bio-fertilizer")
    notes: Optional[str] = Field(None, description="Additional application notes")


class ScheduleItem(BaseModel):
    stage: str = Field(..., description="Growth stage for application")
    instruction: str = Field(..., description="Application instruction")


class FertilizerRecommendationResponse(BaseModel):
    crop: Optional[str] = Field(None, description="Predicted/recommended crop")
    fertilizers: List[FertilizerItem] = Field(default_factory=list, description="Recommended fertilizers")
    schedule: Optional[List[ScheduleItem]] = Field(None, description="Application schedule by growth stage")
    soil_summary: Optional[str] = Field(None, description="Brief soil health context")

