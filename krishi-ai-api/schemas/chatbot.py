"""Pydantic models for chatbot."""
from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str

