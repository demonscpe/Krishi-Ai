"""Irrigation prediction router."""
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from config import MODEL_DIR

router = APIRouter(tags=["Irrigation"], prefix="/api/irrigation")


class IrrigationRequest(BaseModel):
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Humidity in %")
    moisture: float = Field(..., description="Soil moisture")
    soil_type: int = Field(..., description="Soil type encoded")
    crop_type: int = Field(..., description="Crop type encoded")
    nitrogen: float = Field(..., description="Nitrogen level")
    potassium: float = Field(..., description="Potassium level")
    phosphorous: float = Field(..., description="Phosphorous level")


class IrrigationResponse(BaseModel):
    prediction: str


_model = None
_label_encoder = None


def _get_model():
    global _model, _label_encoder
    if _model is None:
        _model = joblib.load(MODEL_DIR / "irrigation_model.pkl")
        _label_encoder = joblib.load(MODEL_DIR / "label_encoder.pkl")
    return _model, _label_encoder


@router.post("/predict", response_model=IrrigationResponse)
async def predict_irrigation(data: IrrigationRequest):
    """Predict irrigation needs based on soil and crop parameters."""
    try:
        model, le = _get_model()
        features = np.array([[
            data.temperature, data.humidity, data.moisture,
            data.soil_type, data.crop_type,
            data.nitrogen, data.potassium, data.phosphorous
        ]])
        prediction = model.predict(features)
        label = le.inverse_transform(prediction)[0]
        return IrrigationResponse(prediction=str(label))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

