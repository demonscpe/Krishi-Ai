"""Sugarcane disease detection router."""
import os
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas.disease import SugarcanePredictResponse
from config import UPLOAD_DIR, MODEL_DIR

router = APIRouter(tags=["Sugarcane"], prefix="/api/sugarcane")

SUGARCANE_CLASSES = [
    'Bacterial Leaf Blight', 'Bacterial Leaf Streak', 'Bacterial Panicle Blight', 'Blast',
    'Brown Spot', 'Dead Heart', 'Downy Mildew', 'Hispa', 'Normal', 'Tungro'
]

_model = None


def _get_model():
    global _model
    if _model is None:
        model_path = MODEL_DIR / "sugarcane_model.h5"
        _model = tf.keras.models.load_model(str(model_path), compile=False)
    return _model


@router.post("/predict", response_model=SugarcanePredictResponse)
async def sugarcane_predict(image: UploadFile = File(...)):
    """Predict sugarcane disease from an uploaded image."""
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image provided")

    temp_path = UPLOAD_DIR / image.filename
    try:
        content = await image.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        model = _get_model()
        img = Image.open(temp_path).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        pred = model.predict(img_array, verbose=0)
        class_idx = int(np.argmax(pred[0]))
        confidence = float(np.max(pred[0]))

        return SugarcanePredictResponse(
            prediction=SUGARCANE_CLASSES[class_idx],
            confidence=round(confidence, 4)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists():
            os.remove(temp_path)

