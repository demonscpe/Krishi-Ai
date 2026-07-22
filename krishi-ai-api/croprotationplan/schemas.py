"""Pydantic schemas for 3-year crop rotation plan."""
from pydantic import BaseModel, Field
from typing import List, Optional


class RotationPlanRequest(BaseModel):
    previous_crop: str = Field(..., description="Current/previous crop e.g. Rice, Wheat")
    nitrogen: float = Field(..., ge=0, description="Soil nitrogen kg/ha")
    phosphorus: float = Field(..., ge=0, description="Soil phosphorus kg/ha")
    potassium: float = Field(..., ge=0, description="Soil potassium kg/ha")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    moisture_level: float = Field(..., ge=0, le=100, description="Soil moisture %")


class YearPlan(BaseModel):
    year: int
    crop: str
    season: str
    months: str
    family: str
    base_yield: float
    soil_health_pct: int
    sowing_month: str
    harvest_month: str


class NutrientBalance(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float


class SustainabilityMetrics(BaseModel):
    fertilizer_reduction_pct: int
    disease_suppression_pct: int
    water_efficiency_pct: int


class FinancialImpact(BaseModel):
    rotation_profit: int
    monoculture_profit: int
    rotation_advantage: int


class RotationPlanResponse(BaseModel):
    previous_crop: str
    year_plans: List[YearPlan]
    nutrient_balance: NutrientBalance
    sustainability: SustainabilityMetrics
    financial: FinancialImpact
    key_actions: List[str]
