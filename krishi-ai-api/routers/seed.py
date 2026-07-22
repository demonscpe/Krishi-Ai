"""Seed quality prediction router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from services.seed_quality import predict_seed_quality

router = APIRouter(tags=["Seed"], prefix="/api/seed")


class SeedQualityResponse(BaseModel):
    class_field: str
    confidence: float


@router.post("/quality")
async def seed_quality(file: UploadFile = File(...)):
    """Predict seed quality from an uploaded image."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        file_bytes = await file.read()
        result = await predict_seed_quality(file_bytes, file.filename)
        return {
            "class": result["class"],
            "confidence": result["confidence"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

