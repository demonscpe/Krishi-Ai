"""Soil analysis service."""
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parent / "models" / "soil_analysis_model.pkl"

SOIL_CROP_MAP = {
    "Loamy":  ["Wheat", "Rice", "Maize", "Soybean", "Sugarcane", "Cotton"],
    "Clayey": ["Rice", "Wheat", "Maize", "Sorghum", "Cotton"],
    "Sandy":  ["Millets", "Groundnut", "Mustard", "Barley", "Sorghum"],
    "Saline": ["Barley", "Mustard", "Sorghum", "Millets"],
}

RECOMMENDATIONS = {
    "Good": [
        "Maintain organic matter with compost or green manure.",
        "Continue balanced NPK fertilization.",
        "Practice crop rotation to sustain fertility.",
    ],
    "Moderate": [
        "Add organic compost to improve soil structure.",
        "Apply micronutrient supplements (Zn, Fe, Mn).",
        "Reduce tillage to prevent nutrient loss.",
        "Test soil every season to monitor changes.",
    ],
    "Poor": [
        "Apply heavy organic amendments (FYM, vermicompost).",
        "Use green manure crops like Dhaincha or Sunhemp.",
        "Correct pH with lime (acidic) or gypsum (saline/alkaline).",
        "Avoid water-intensive crops until soil improves.",
        "Consider soil reclamation techniques for saline soils.",
    ],
}

_model = None


def _get_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
    return _model


def _rule_based_quality(data: dict) -> str:
    score = 0
    if data["N"] >= 70: score += 2
    elif data["N"] >= 50: score += 1
    if data["P"] >= 35: score += 2
    elif data["P"] >= 25: score += 1
    if data["K"] >= 30: score += 2
    elif data["K"] >= 20: score += 1
    if 6.0 <= data["pH"] <= 7.5: score += 2
    elif 5.5 <= data["pH"] <= 8.0: score += 1
    if data["EC"] <= 0.5: score += 2
    elif data["EC"] <= 1.5: score += 1
    if data["OC"] >= 1.5: score += 2
    elif data["OC"] >= 0.8: score += 1

    if score >= 10: return "Good"
    if score >= 6: return "Moderate"
    return "Poor"


def _fertility_score(data: dict) -> float:
    """Return a 0–100 fertility score."""
    n_score = min(data["N"] / 100, 1.0) * 25
    p_score = min(data["P"] / 50, 1.0) * 20
    k_score = min(data["K"] / 45, 1.0) * 20
    ph_score = (1 - abs(data["pH"] - 6.8) / 3.5) * 20
    oc_score = min(data["OC"] / 2.5, 1.0) * 15
    return round(max(0, n_score + p_score + k_score + ph_score + oc_score), 1)


def analyze(data: dict) -> dict:
    """Analyze soil and return quality, score, recommendations, and suitable crops."""
    model = _get_model()

    if model:
        import pandas as pd
        features = pd.DataFrame([{k: data[k] for k in ["N", "P", "K", "pH", "EC", "OC", "S", "Zn", "Fe", "Cu", "Mn", "B"]}])
        quality = model.predict(features)[0]
    else:
        quality = _rule_based_quality(data)

    return {
        "soil_quality": quality,
        "fertility_score": _fertility_score(data),
        "recommendations": RECOMMENDATIONS.get(quality, RECOMMENDATIONS["Moderate"]),
        "suitable_crops": SOIL_CROP_MAP.get(data.get("soil_type", ""), ["Wheat", "Millets"]),
    }
