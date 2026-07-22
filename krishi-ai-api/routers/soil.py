"""Soil quality prediction router."""
from fastapi import APIRouter, HTTPException
import numpy as np
from schemas.soil import SoilQualityRequest, SoilQualityResponse
from services.ml_models import get_soil_quality_model

router = APIRouter(tags=["Soil"], prefix="/api/soil")


@router.post("/quality", response_model=SoilQualityResponse)
async def soil_quality(data: SoilQualityRequest):
    """Predict soil quality based on soil parameters."""
    try:
        model = get_soil_quality_model()
        features = np.array([
            data.N, data.P, data.K, data.pH, data.EC,
            data.OC, data.S, data.Zn, data.Fe, data.Cu,
            data.Mn, data.B
        ]).reshape(1, -1)
        prediction = model.predict(features)
        return SoilQualityResponse(prediction=str(prediction[0]))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

