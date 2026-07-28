"""Pydantic schemas for disease chatbot."""
from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any


class DiseaseChatbotRequest(BaseModel):
    message: str = Field(..., description="User's message")
    crop: Optional[str] = Field(None, description="Crop name (shorthand for context)")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Context data (plant, disease, etc.)")

    @model_validator(mode="after")
    def merge_crop_into_context(self):
        if self.crop:
            ctx = dict(self.context or {})
            ctx.setdefault("plant", self.crop)
            self.context = ctx
        return self


class DiseaseChatbotResponse(BaseModel):
    reply: str = Field(..., description="Bot's reply")
