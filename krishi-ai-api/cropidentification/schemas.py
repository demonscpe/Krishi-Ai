"""Pydantic schemas for crop identification."""
from pydantic import BaseModel
from typing import List, Optional


class IdentificationResult(BaseModel):
    crop_name: str
    confidence: Optional[float] = None
    description: Optional[str] = None
    alternatives: List[dict] = []
    source: str = "AI"
