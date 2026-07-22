"""Crop prediction & recommendation router."""
from fastapi import APIRouter, HTTPException
from schemas.crop import (
    CropPredictRequest, CropPredictResponse,
    AlternativeCrop,
    CropRecommendRequest, CropRecommendResponse,
)
from services.crop_predict import predict_crop
from services.ml_models import get_crop_recommendation_model
import pandas as pd

router = APIRouter(tags=["Crop"], prefix="/api/crop")


@router.post("/predict", response_model=CropPredictResponse)
async def crop_predict(data: CropPredictRequest):
    """Predict the best crop based on soil parameters."""
    try:
        result = await predict_crop(data.model_dump())
        return CropPredictResponse(
            Prediction=result["Prediction"],
            Confidence=result.get("Confidence"),
            Alternatives=[AlternativeCrop(**a) for a in result.get("Alternatives", [])],
            AIInsight=result.get("AIInsight"),
            Category=result["Category"],
            Source=result.get("Source", "ML"),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend", response_model=CropRecommendResponse)
async def crop_recommend(data: CropRecommendRequest):
    """Recommend a crop based on previous crop and soil data."""
    try:
        model = get_crop_recommendation_model()

        previous_crop_mapping = {
            'Groundnut': 1, 'Millets': 2, 'Wheat': 3, 'Maize': 4,
            'Cotton': 5, 'Sorghum': 6, 'Barley': 7
        }
        soil_type_mapping = {
            'Loamy': 1, 'Clayey': 2, 'Sandy': 3, 'Saline': 4
        }
        crop_mapping = {
            1: 'Wheat', 2: 'Rice', 3: 'Millets', 4: 'Cotton',
            5: 'Groundnut', 6: 'Maize', 7: 'Sorghum', 8: 'Barley'
        }

        d = data.model_dump(by_alias=True)
        input_data = pd.DataFrame([{
            "Previous Crop": previous_crop_mapping.get(d.get("Previous Crop"), -1),
            "Soil Type": soil_type_mapping.get(d.get("Soil Type"), -1),
            "Moisture Level": d.get("Moisture Level"),
            "Nitrogen (N)": d.get("Nitrogen (N)"),
            "Phosphorus (P)": d.get("Phosphorus (P)"),
            "Potassium (K)": d.get("Potassium (K)")
        }])

        prediction = model.predict(input_data)
        crop = crop_mapping.get(prediction[0], "No prediction available")
        return CropRecommendResponse(Recommended_Crop=crop)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

