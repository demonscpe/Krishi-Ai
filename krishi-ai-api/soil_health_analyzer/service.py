"""Soil Health Analyzer service.
Uses trained ML regressor (XGBoost/RandomForest) when available,
falls back to rule-based logic.
"""
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from soil_health_analyzer.rules import analyze_nutrients, generate_summary
from soil_test_input.service import get_latest_soil_test

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_PATH = MODEL_DIR / "soil_health_model.pkl"

FEATURES = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'organic_carbon', 'ec']

_model_cache = {}


def _load_model():
    """Load trained ML model if available."""
    if "model" not in _model_cache and MODEL_PATH.exists():
        data = joblib.load(MODEL_PATH)
        _model_cache["model"] = data.get("model", data)
        _model_cache["model_type"] = data.get("model_type", "Unknown")
        _model_cache["features"] = data.get("features", FEATURES)
        _model_cache["metrics"] = data.get("metrics", {})
    return _model_cache.get("model")


def _predict_ml(soil_data: dict) -> tuple:
    """Predict health score using ML model."""
    model = _load_model()
    if model is None:
        return None
    
    X = pd.DataFrame([{k: soil_data.get(k, 0) for k in FEATURES}])
    predicted_score = float(model.predict(X)[0])
    predicted_score = max(0, min(100, round(predicted_score, 1)))
    return predicted_score


def analyze_soil_health() -> dict:
    """Analyze soil health using ML model (preferred) or rule-based logic."""
    soil_data = get_latest_soil_test()
    
    # Try ML model first
    ml_score = _predict_ml(soil_data)
    
    if ml_score is not None:
        score = ml_score
        # Still use rule-based breakdown for explainability
        breakdown, _ = analyze_nutrients(soil_data)
    else:
        breakdown, score = analyze_nutrients(soil_data)
    
    summary = generate_summary(score, breakdown)
    
    return {
        "score": score,
        "summary": summary,
        "breakdown": breakdown,
    }

