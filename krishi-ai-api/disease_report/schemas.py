"""Pydantic schemas for disease report."""
from pydantic import BaseModel, Field
from typing import Optional


class DiseaseReportResponse(BaseModel):
    filename: str = Field(..., description="PDF filename")
    base64_pdf: str = Field(..., description="Base64-encoded PDF content")
