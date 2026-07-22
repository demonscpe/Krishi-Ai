"""Fertilizer recommendation router."""
from fastapi import APIRouter, HTTPException
import pandas as pd
from schemas.soil import FertilizerRequest, FertilizerResponse
from services.ml_models import get_fertilizer_model, get_classifier_model

router = APIRouter(tags=["Fertilizer"], prefix="/api/fertilizer")


@router.post("/predict", response_model=FertilizerResponse)
async def fertilizer_predict(data: FertilizerRequest):
    """Predict the best fertilizer based on soil nutrients."""
    try:
        fertilizer_model = get_fertilizer_model()
        classifier_model = get_classifier_model()

        query_df = pd.DataFrame([data.model_dump()])
        prediction = fertilizer_model.classes_[classifier_model.predict(query_df)]
        return FertilizerResponse(Prediction=str(prediction))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

