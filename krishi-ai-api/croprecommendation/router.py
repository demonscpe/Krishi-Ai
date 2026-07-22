"""Consolidated crop prediction, recommendation & accuracy router."""
from fastapi import APIRouter, HTTPException, Query
from croprecommendation.schemas import (
    CropPredictRequest, CropPredictResponse,
    CropRecommendRequest, CropRecommendResponse,
    AlternativeCrop,
    AccuracyResponse, AccuracyMetrics,
)
from croprecommendation.service import predict_crop, recommend_crop, evaluate_accuracy
from typing import Optional

router = APIRouter(tags=["Crop Recommendation"], prefix="/api/croprecommendation")


@router.post("/predict", response_model=CropPredictResponse)
async def crop_predict(data: CropPredictRequest):
    """Predict the best crop based on soil parameters.

    Uses ML models (RandomForest / SVC) per category:
    - field_crops, vegetables, flowers
    Falls back to Gemini AI for low-confidence vegetable/flower predictions.
    """
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
    """Recommend a crop based on previous crop and soil data (rotation)."""
    try:
        result = await recommend_crop(data.model_dump(by_alias=True))
        return CropRecommendResponse(Recommended_Crop=result["Recommended Crop"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/accuracy", response_model=AccuracyResponse)
async def crop_accuracy(category: Optional[str] = Query(None, description="Filter by category: field_crops, vegetables, flowers")):
    """Evaluate model accuracy on the Crop_recommendation.csv dataset.

    Returns overall accuracy + per-category metrics (precision, recall, F1).
    """
    try:
        result = evaluate_accuracy(category)
        return AccuracyResponse(
            overall_accuracy=result['overall_accuracy'],
            per_category=[AccuracyMetrics(**m) for m in result['per_category']],
            total_samples=result['total_samples'],
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

