"""Soil quality prediction router."""
from fastapi import APIRouter, HTTPException
import numpy as np
from schemas.soil import SoilQualityRequest, SoilQualityResponse
from services.ml_models import get_soil_quality_model

router = APIRouter(tags=["Soil"], prefix="/api/soil")


@router.post("/quality", response_model=SoilQualityResponse)
async def soil_quality(data: SoilQualityRequest):
    """Predict soil quality based on soil parameters.

    Uses ML model when available (6 features: N, P, K, pH, EC, OC),
    falls back to rule-based scoring otherwise.
    """
    try:
        model_data = get_soil_quality_model()
        # Check if model_data is a dict wrapper (from soil_health_analyzer/trainer.py)
        if isinstance(model_data, dict) and "model" in model_data:
            model = model_data["model"]
            expected_features = model_data.get("features", ["nitrogen", "phosphorus", "potassium", "ph", "organic_carbon", "ec"])
        else:
            model = model_data
            expected_features = ["nitrogen", "phosphorus", "potassium", "ph", "organic_carbon", "ec"]

        # Map 12 input fields to 6 core soil health features
        feature_map = {
            "nitrogen": data.N,
            "phosphorus": data.P,
            "potassium": data.K,
            "ph": data.pH,
            "organic_carbon": data.OC,
            "ec": data.EC,
        }

        if model is not None and hasattr(model, "predict"):
            # Only use features the model was trained on
            features = np.array([[feature_map[f] for f in expected_features]]).reshape(1, -1)
            prediction = model.predict(features)
            return SoilQualityResponse(prediction=str(prediction[0]))
        else:
            # Rule-based fallback (same logic as soil/service.py)
            score = 0
            if data.N >= 70: score += 2
            elif data.N >= 50: score += 1
            if data.P >= 35: score += 2
            elif data.P >= 25: score += 1
            if data.K >= 30: score += 2
            elif data.K >= 20: score += 1
            if 6.0 <= data.pH <= 7.5: score += 2
            elif 5.5 <= data.pH <= 8.0: score += 1
            if data.EC <= 0.5: score += 2
            elif data.EC <= 1.5: score += 1
            if data.OC >= 1.5: score += 2
            elif data.OC >= 0.8: score += 1

            if score >= 10: quality = "Good"
            elif score >= 6: quality = "Moderate"
            else: quality = "Poor"

            return SoilQualityResponse(prediction=quality)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

