"""Pydantic schemas for disease history."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class HistoryRecord(BaseModel):
    date: Optional[str] = None
    plant: Optional[str] = None
    disease: Optional[str] = None
    severity: Optional[str] = None
    treatment: Optional[str] = None
    recovery_status: Optional[str] = None


class DiseaseHistoryStats(BaseModel):
    total_records: int = 0
    most_frequent_disease: str = "N/A"
    most_frequent_crop: str = "N/A"
    healthy_percentage: float = 0


class DiseaseHistoryResponse(BaseModel):
    records: List[HistoryRecord] = []
    stats: Optional[DiseaseHistoryStats] = None
