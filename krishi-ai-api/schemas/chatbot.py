"""Pydantic models for chatbot with RAG support."""
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List


class ChatRequest(BaseModel):
    prompt: Optional[str] = Field(None, min_length=1, max_length=2000)
    message: Optional[str] = Field(None, min_length=1, max_length=2000)
    user_id: Optional[str] = None

    @model_validator(mode="after")
    def resolve_prompt(self):
        if not self.prompt and self.message:
            self.prompt = self.message
        if not self.prompt:
            raise ValueError("Either 'prompt' or 'message' must be provided")
        return self


class SourceInfo(BaseModel):
    source: str = Field(..., description="Source filename from knowledge base")
    heading: str = Field(..., description="Section heading")
    relevance: float = Field(..., description="Relevance score 0-1")


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI-generated response")
    sources: List[SourceInfo] = Field(default_factory=list, description="RAG source references")
    has_context: bool = Field(default=False, description="Whether RAG context was used")

