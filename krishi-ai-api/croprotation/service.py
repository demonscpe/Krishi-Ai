"""Crop rotation recommendation service."""
import joblib
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "crop_rotation_recommendation_model.pkl"
DATA_PATH = BASE_DIR / "data" / "crop_rotation_dataset.csv"

PREVIOUS_CROP_MAP = {
    "Groundnut": 1, "Millets": 2, "Wheat": 3, "Maize": 4,
    "Cotton": 5, "Sorghum": 6, "Barley": 7, "Rice": 8,
}
SOIL_TYPE_MAP = {"Loamy": 1, "Clayey": 2, "Sandy": 3, "Saline": 4}
CROP_MAP = {
    1: "Wheat", 2: "Rice", 3: "Millets", 4: "Cotton",
    5: "Groundnut", 6: "Maize", 7: "Sorghum", 8: "Barley",
}

# Rule-based fallback when model is unavailable
ROTATION_RULES = {
    "Rice": "Chickpea", "Wheat": "Soybean", "Maize": "Chickpea",
    "Cotton": "Wheat", "Groundnut": "Wheat", "Sorghum": "Chickpea",
    "Barley": "Mustard", "Millets": "Wheat",
}

REASONS = {
    "Chickpea": "Legume — fixes nitrogen, breaks cereal pest cycles.",
    "Soybean": "Legume — restores N and P, improves soil structure.",
    "Wheat": "Cereal — suits post-legume fields with restored nitrogen.",
    "Mustard": "Oilseed — low water demand, good for rabi season.",
    "Maize": "Cereal — high yield on nitrogen-rich post-legume soil.",
    "Cotton": "Cash crop — benefits from improved soil after legumes.",
    "Groundnut": "Legume — fixes nitrogen, ideal after cereals.",
    "Rice": "Cereal — suits high-moisture fields after legumes.",
    "Millets": "Cereal — drought-tolerant, good on sandy soils.",
    "Sorghum": "Cereal — heat-tolerant, suits post-legume rotation.",
}

_model = None


def _get_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
    return _model


def recommend(data: dict) -> dict:
    """Return rotation recommendation using ML model or rule-based fallback."""
    prev = data.get("Previous Crop", "")
    model = _get_model()

    if model:
        input_df = pd.DataFrame([{
            "Previous Crop": PREVIOUS_CROP_MAP.get(prev, -1),
            "Soil Type": SOIL_TYPE_MAP.get(data.get("Soil Type", ""), -1),
            "Moisture Level": data.get("Moisture Level", 50),
            "Nitrogen (N)": data.get("Nitrogen (N)", 0),
            "Phosphorus (P)": data.get("Phosphorus (P)", 0),
            "Potassium (K)": data.get("Potassium (K)", 0),
        }])
        pred = model.predict(input_df)
        crop = CROP_MAP.get(int(pred[0]), ROTATION_RULES.get(prev, "Wheat"))
    else:
        crop = ROTATION_RULES.get(prev, "Wheat")

    return {
        "Recommended Crop": crop,
        "reason": REASONS.get(crop, "Suitable for your soil and previous crop combination."),
    }
