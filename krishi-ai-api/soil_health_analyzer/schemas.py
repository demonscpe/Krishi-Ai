"""Pydantic schemas for Soil Health Analyzer module."""
from pydantic import BaseModel, Field
from typing import List, Optional


class NutrientBreakdown(BaseModel):
    nutrient: str = Field(..., description="Nutrient name (e.g., Nitrogen, pH)")
    value: str = Field(..., description="Current value with unit")
    status: str = Field(..., description="Low, Optimal, or High")
    reason: str = Field(..., description="Why this status was assigned")
    recommendation: str = Field(..., description="Actionable recommendation")
    severity: Optional[str] = Field(None, description="Severity level if Low/High")


class SoilHealthResponse(BaseModel):
    score: float = Field(..., ge=0, le=100, description="Overall soil health score (0-100)")
    summary: str = Field(..., description="High-level summary of soil health")
    breakdown: List[NutrientBreakdown] = Field(..., description="Per-nutrient analysis")

