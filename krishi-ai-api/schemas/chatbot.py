"""Pydantic models for chatbot with RAG support."""
from pydantic import BaseModel, Field
from typing import Optional, List


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)


class SourceInfo(BaseModel):
    source: str = Field(..., description="Source filename from knowledge base")
    heading: str = Field(..., description="Section heading")
    relevance: float = Field(..., description="Relevance score 0-1")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI-generated response")
    sources: List[SourceInfo] = Field(default_factory=list, description="RAG source references")
    has_context: bool = Field(default=False, description="Whether RAG context was used")

