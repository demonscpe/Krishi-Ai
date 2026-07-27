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

        if fertilizer_model is None or classifier_model is None:
            # Fallback: try loading fertilizer_recommendation_model.pkl directly
            import joblib
            from config import MODEL_DIR
            try:
                alt_path = MODEL_DIR / "fertilizer_recommendation_model.pkl"
                if alt_path.exists():
                    alt = joblib.load(alt_path)
                    if hasattr(alt, 'predict'):
                        query_df = pd.DataFrame([data.model_dump()])
                        prediction = alt.predict(query_df)
                        result = str(prediction[0]) if hasattr(prediction, '__getitem__') else str(prediction)
                        return FertilizerResponse(Prediction=result)
            except Exception:
                pass
            raise HTTPException(status_code=503, detail="Fertilizer model not available")

        query_df = pd.DataFrame([data.model_dump()])
        prediction = fertilizer_model.classes_[classifier_model.predict(query_df)]
        return FertilizerResponse(Prediction=str(prediction))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
