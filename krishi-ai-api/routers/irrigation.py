"""Irrigation prediction router."""
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator
from typing import Optional, Union
from config import MODEL_DIR

router = APIRouter(tags=["Irrigation"], prefix="/api/irrigation")

SOIL_TYPE_MAP = {"sandy": 0, "loamy": 1, "black": 2, "red": 3, "clayey": 4, "clay": 4}
CROP_TYPE_MAP = {
    "maize": 0, "sugarcane": 1, "cotton": 2, "tobacco": 3, "paddy": 4,
    "barley": 5, "wheat": 6, "millets": 7, "oil seeds": 8, "pulses": 9,
    "ground nuts": 10, "rice": 4
}


class IrrigationRequest(BaseModel):
    temperature: float = Field(...)
    humidity: float = Field(...)
    moisture: float = Field(...)
    soil_type: Union[int, str] = Field(...)
    crop_type: Optional[Union[int, str]] = Field(None)
    crop: Optional[str] = Field(None)
    nitrogen: float = Field(default=0)
    potassium: float = Field(default=0)
    phosphorous: float = Field(default=0)

    @model_validator(mode="after")
    def encode_fields(self):
        # Resolve crop alias
        if self.crop_type is None and self.crop:
            self.crop_type = self.crop
        # Encode soil_type
        if isinstance(self.soil_type, str):
            self.soil_type = SOIL_TYPE_MAP.get(self.soil_type.lower(), 1)
        # Encode crop_type
        if isinstance(self.crop_type, str):
            self.crop_type = CROP_TYPE_MAP.get(self.crop_type.lower(), 0)
        if self.crop_type is None:
            self.crop_type = 0
        return self


class IrrigationResponse(BaseModel):
    prediction: str


_model = None
_label_encoder = None


def _get_model():
    global _model, _label_encoder
    if _model is None:
        model_path = MODEL_DIR / "irrigation_model.pkl"
        le_path = MODEL_DIR / "label_encoder.pkl"
        if not model_path.exists() or not le_path.exists():
            return None, None
        try:
            _model = joblib.load(model_path)
            _label_encoder = joblib.load(le_path)
        except Exception as e:
            print(f"⚠️ Failed to load irrigation model: {e}")
            return None, None
    return _model, _label_encoder


@router.post("/predict", response_model=IrrigationResponse)
async def predict_irrigation(data: IrrigationRequest):
    """Predict irrigation needs based on soil and crop parameters."""
    try:
        model, le = _get_model()
        if model is None or le is None:
            raise HTTPException(status_code=503, detail="Irrigation model not available — missing model files")
        features = np.array([[
            data.temperature, data.humidity, data.moisture,
            data.soil_type, data.crop_type,
            data.nitrogen, data.potassium, data.phosphorous
        ]])
        prediction = model.predict(features)
        label = le.inverse_transform(prediction)[0]
        return IrrigationResponse(prediction=str(label))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class IrrigationResponse(BaseModel):
    prediction: str


_model = None
_label_encoder = None


def _get_model():
    global _model, _label_encoder
    if _model is None:
        model_path = MODEL_DIR / "irrigation_model.pkl"
        le_path = MODEL_DIR / "label_encoder.pkl"
        if not model_path.exists() or not le_path.exists():
            return None, None
        try:
            _model = joblib.load(model_path)
            _label_encoder = joblib.load(le_path)
        except Exception as e:
            print(f"⚠️ Failed to load irrigation model: {e}")
            return None, None
    return _model, _label_encoder


@router.post("/predict", response_model=IrrigationResponse)
async def predict_irrigation(data: IrrigationRequest):
    """Predict irrigation needs based on soil and crop parameters."""
    try:
        model, le = _get_model()
        if model is None or le is None:
            raise HTTPException(status_code=503, detail="Irrigation model not available — missing model files")
        features = np.array([[
            data.temperature, data.humidity, data.moisture,
            data.soil_type, data.crop_type,
            data.nitrogen, data.potassium, data.phosphorous
        ]])
        prediction = model.predict(features)
        label = le.inverse_transform(prediction)[0]
        return IrrigationResponse(prediction=str(label))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
