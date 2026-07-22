"""Pydantic schemas for disease chatbot."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class DiseaseChatbotRequest(BaseModel):
    message: str = Field(..., description="User's message")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Context data (plant, disease, etc.)")


class DiseaseChatbotResponse(BaseModel):
    reply: str = Field(..., description="Bot's reply")
