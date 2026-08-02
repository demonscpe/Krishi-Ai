"""Pydantic schemas for crop identification."""
from pydantic import BaseModel, Field
from typing import List, Optional


class IdentificationResult(BaseModel):
    crop_name: str
    confidence: Optional[float] = None
    description: Optional[str] = None
    alternatives: List[dict] = []
    source: str = "AI"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2_000)
    crop_context: str = Field(default="", max_length=8_000)


class ChatResponse(BaseModel):
    reply: str
    source: str = "AI"


class HealthResponse(BaseModel):
    status: str = "ok"
    message: str = "Crop Identification API is running"
