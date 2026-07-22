"""Pydantic models for disease detection endpoints."""
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict


class DiseasePredictResponse(BaseModel):
    prediction: str
    details: Optional[Dict[str, Any]] = None


class SugarcanePredictResponse(BaseModel):
    prediction: str
    confidence: Optional[float] = None


class PaddyPredictResponse(BaseModel):
    prediction: str
    details: Optional[Dict[str, Any]] = None

