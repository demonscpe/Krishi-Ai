"""Paddy disease detection router."""
import os
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas.disease import PaddyPredictResponse
from config import UPLOAD_DIR, MODEL_DIR

router = APIRouter(tags=["Paddy"], prefix="/api/paddy")

MODIFIED_CLASS_LABELS = [
    'Bacterial Leaf Blight', 'Bacterial Leaf Streak', 'Bacterial Panicle Blight', 'Blast',
    'Brown Spot', 'Dead Heart', 'Downy Mildew', 'Hispa', 'Normal', 'Tungro'
]

LABEL_DESCRIPTIONS = [
    {"label": "bacterial_leaf_blight", "description": "A bacterial infection causing dark, water-soaked lesions on leaves.", "symptoms": "Yellowing and browning of leaves, water-soaked spots, leaf curling.", "impact": "Severe infection can lead to yield loss.", "recommended_action": "Apply copper-based bactericides and practice crop rotation."},
    {"label": "bacterial_leaf_streak", "description": "Bacterial disease with long, narrow streaks on leaves.", "symptoms": "Yellow streaks along veins, turning brown.", "impact": "Reduced photosynthesis, lower yields.", "recommended_action": "Improve field drainage, use resistant varieties."},
    {"label": "bacterial_panicle_blight", "description": "Bacterial disease affecting the panicle.", "symptoms": "Browning and blighting of panicle, poor seed formation.", "impact": "Significant yield reduction.", "recommended_action": "Remove infected plants, use disease-resistant varieties."},
    {"label": "blast", "description": "Fungal disease attacking leaves, stems, and panicles.", "symptoms": "Spindle-shaped lesions with brown borders.", "impact": "Severe yield losses.", "recommended_action": "Apply appropriate fungicides, use resistant varieties."},
    {"label": "brown_spot", "description": "Fungal infection causing brown lesions on leaves.", "symptoms": "Small round to oval brown spots.", "impact": "Moderate to severe defoliation.", "recommended_action": "Apply foliar fungicides, maintain crop health."},
    {"label": "dead_heart", "description": "Central shoot dies due to insect or disease damage.", "symptoms": "Central shoot turns brown while surrounding leaves unaffected.", "impact": "Reduced yield, stunted growth.", "recommended_action": "Remove affected plants, control pests."},
    {"label": "downy_mildew", "description": "Fungal disease with downy mold-like growth.", "symptoms": "White to grayish fungal growth on leaf underside.", "impact": "Weakened plants, reduced photosynthesis.", "recommended_action": "Apply fungicides, practice crop rotation."},
    {"label": "hispa", "description": "Insect pest causing white streaks on leaves.", "symptoms": "White linear streaks along leaves.", "impact": "Significant leaf area loss.", "recommended_action": "Use insecticides and biological controls."},
    {"label": "normal", "description": "Healthy plant.", "symptoms": "None observed.", "impact": "No adverse effects.", "recommended_action": "Maintain regular care practices."},
    {"label": "tungro", "description": "Viral disease transmitted by leafhoppers.", "symptoms": "Yellow-orange discoloration, stunted growth.", "impact": "Severe yield loss.", "recommended_action": "Use resistant varieties, control leafhoppers."}
]

_model = None


def _get_model():
    global _model
    if _model is None:
        import tensorflow as tf
        model_path = MODEL_DIR / "rice_model.h5"
        _model = tf.keras.models.load_model(str(model_path), compile=False)
    return _model


@router.post("/predict", response_model=PaddyPredictResponse)
async def paddy_predict(image: UploadFile = File(...)):
    """Predict paddy disease from an uploaded image."""
    import tensorflow as tf
    from tensorflow.keras.preprocessing.image import load_img, img_to_array

    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image provided")

    temp_path = UPLOAD_DIR / image.filename
    try:
        content = await image.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        model = _get_model()
        img = load_img(str(temp_path), target_size=(256, 256))
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.cast(img_array / 255.0, tf.float32)

        predictions = model.predict(img_array, verbose=0)
        predicted_class = int(np.argmax(predictions, axis=1)[0])

        label = MODIFIED_CLASS_LABELS[predicted_class]
        details = LABEL_DESCRIPTIONS[predicted_class]

        return PaddyPredictResponse(prediction=label, details=details)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists():
            os.remove(temp_path)

