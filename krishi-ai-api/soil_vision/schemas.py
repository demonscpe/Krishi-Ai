"""Pydantic schemas for the Soil Vision module."""
from pydantic import BaseModel, Field


class SoilVisionAnalyzeResponse(BaseModel):
    mode: str = Field(..., description="The vision mode used (detection|health_analysis|health_rating|visual_analysis)")
    result: str = Field(..., description="AI vision analysis text result")


class SoilVisionChatRequest(BaseModel):
    mode: str = Field(..., description="detection|health_analysis|health_rating|visual_analysis")
    message: str = Field(..., min_length=1, max_length=2_000)
    context: str = Field(default="", max_length=8_000)


class SoilVisionChatResponse(BaseModel):
    reply: str = Field(..., description="AI assistant reply text")

