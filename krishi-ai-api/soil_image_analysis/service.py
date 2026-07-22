"""Soil Image Analysis service.
Uses trained ML model (RandomForest) when available, falls back to rule-based logic.
"""
from pathlib import Path
from typing import Optional
import numpy as np
import pandas as pd
import joblib
from PIL import Image
import io

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "models"
TARGETS = ['soil_type', 'color', 'texture', 'condition']
FEATURES = ['avg_r', 'avg_g', 'avg_b', 'std_r', 'std_g', 'std_b', 'brightness']

# Rule-based fallback configuration
SOIL_TYPE_RULES = {
    "Black": {"avg_r": (0, 60), "avg_g": (0, 50), "avg_b": (0, 40)},
    "Red": {"avg_r": (120, 255), "avg_g": (40, 100), "avg_b": (20, 60)},
    "Sandy": {"avg_r": (160, 220), "avg_g": (140, 200), "avg_b": (90, 160)},
    "Clay": {"avg_r": (80, 160), "avg_g": (50, 110), "avg_b": (30, 70)},
    "Loamy": {"avg_r": (60, 140), "avg_g": (80, 150), "avg_b": (40, 100)},
    "Alluvial": {"avg_r": (100, 180), "avg_g": (90, 170), "avg_b": (60, 130)},
}

TEXTURE_RULES = {
    "Sandy": {"std_r": (30, 60), "std_g": (25, 55), "std_b": (20, 50)},
    "Silty": {"std_r": (15, 35), "std_g": (15, 35), "std_b": (10, 30)},
    "Clayey": {"std_r": (5, 20), "std_g": (5, 20), "std_b": (5, 15)},
    "Loamy": {"std_r": (10, 30), "std_g": (10, 30), "std_b": (10, 25)},
}

COLOR_MAP = {
    "Black": "Black", "Red": "Reddish", "Sandy": "Yellowish",
    "Clay": "Grey", "Loamy": "Dark Brown", "Alluvial": "Brown",
}

CONDITION_RULES = {
    "Dry": (180, 255), "Moist": (100, 180), "Wet": (30, 100),
    "Cracked": (150, 230), "Eroded": (100, 200),
}

# Model cache
_model_cache = {}


def _load_model():
    """Load trained ML model if available."""
    model_path = MODEL_DIR / "soil_image_analysis_model.pkl"
    if model_path.exists() and "model" not in _model_cache:
        data = joblib.load(model_path)
        _model_cache["model"] = data["model"]
        _model_cache["targets"] = data["targets"]
        # Load label encoders
        _model_cache["les"] = {}
        for target in data["targets"]:
            le_path = MODEL_DIR / f"soil_image_{target}_le.pkl"
            if le_path.exists():
                _model_cache["les"][target] = joblib.load(le_path)
    return _model_cache.get("model")


def _extract_features(image_bytes: bytes) -> dict:
    """Extract color-based features from image."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    pixels = np.array(img)
    
    return {
        "avg_r": float(np.mean(pixels[:, :, 0])),
        "avg_g": float(np.mean(pixels[:, :, 1])),
        "avg_b": float(np.mean(pixels[:, :, 2])),
        "std_r": float(np.std(pixels[:, :, 0])),
        "std_g": float(np.std(pixels[:, :, 1])),
        "std_b": float(np.std(pixels[:, :, 2])),
        "brightness": float(np.mean(pixels)),
    }


def _predict_ml(features: dict) -> tuple[str, str, str, str, float]:
    """Predict using trained ML model."""
    model = _load_model()
    if model is None:
        return None
    
    feature_array = pd.DataFrame([features])[FEATURES].values
    pred = model.predict(feature_array)[0]
    proba = model.predict_proba(feature_array)[0]
    confidence = round(float(np.max(proba) * 100), 1)
    
    les = _model_cache.get("les", {})
    targets = _model_cache.get("targets", TARGETS)
    
    result = {}
    for i, target in enumerate(targets):
        le = les.get(target)
        if le and pred.ndim > 1:
            result[target] = le.inverse_transform([pred[i]])[0]
        elif le:
            result[target] = le.inverse_transform([pred[i]])[0]
        else:
            result[target] = str(pred[i])
    
    return (
        result.get("soil_type", "Unknown"),
        result.get("color", "Unknown"),
        result.get("texture", "Unknown"),
        result.get("condition", "Unknown"),
        confidence,
    )


def _predict_rule_based(features: dict) -> tuple[str, str, str, str, float]:
    """Fallback rule-based prediction."""
    # Soil type
    type_scores = {}
    for soil_type, rules in SOIL_TYPE_RULES.items():
        score = 0
        for ch in ["r", "g", "b"]:
            val = features[f"avg_{ch}"]
            lo, hi = rules[f"avg_{ch}"]
            if lo <= val <= hi:
                score += 1
            else:
                dist = min(abs(val - lo), abs(val - hi))
                if dist < 30:
                    score += 0.5
        type_scores[soil_type] = score / 3.0
    
    soil_type = max(type_scores, key=type_scores.get)
    type_conf = round(type_scores[soil_type] * 100, 1)
    color = COLOR_MAP.get(soil_type, "Brown")
    
    # Texture
    tex_scores = {}
    for texture, rules in TEXTURE_RULES.items():
        score = 0
        for ch in ["r", "g", "b"]:
            val = features[f"std_{ch}"]
            lo, hi = rules[f"std_{ch}"]
            if lo <= val <= hi:
                score += 1
            else:
                dist = min(abs(val - lo), abs(val - hi))
                if dist < 10:
                    score += 0.5
        tex_scores[texture] = score / 3.0
    
    texture = max(tex_scores, key=tex_scores.get)
    tex_conf = round(tex_scores[texture] * 100, 1)
    
    # Condition
    brightness = features["brightness"]
    condition = "Moist"
    cond_conf = 50.0
    for cond, (lo, hi) in CONDITION_RULES.items():
        if lo <= brightness <= hi:
            condition = cond
            cond_conf = 75.0
            break
    
    overall_conf = round((type_conf + tex_conf + cond_conf) / 3, 1)
    return soil_type, color, texture, condition, overall_conf


def analyze_image(image_bytes: bytes) -> dict:
    """Analyze soil image using ML model (preferred) or rule-based fallback."""
    features = _extract_features(image_bytes)
    
    # Try ML model first
    result = _predict_ml(features)
    
    if result is not None:
        soil_type, color, texture, condition, confidence = result
    else:
        soil_type, color, texture, condition, confidence = _predict_rule_based(features)
    
    return {
        "soil_type": soil_type,
        "color": color,
        "texture": texture,
        "condition": condition,
        "confidence": confidence,
    }

