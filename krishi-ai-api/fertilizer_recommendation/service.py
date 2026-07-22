"""Fertilizer Recommendation service.
Uses trained ML classifier (XGBoost/RandomForest) when available,
falls back to rule-based logic.
"""
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from fertilizer_recommendation.rule_engine import recommend_fertilizers, generate_soil_summary, DEFAULT_SCHEDULE
from soil_test_input.service import get_latest_soil_test

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "models"
CLASSIFIER_PATH = MODEL_DIR / "fertilizer_recommendation_model.pkl"
LE_PATH = MODEL_DIR / "fertilizer_recommendation_le.pkl"
QUANTITY_PATH = MODEL_DIR / "fertilizer_quantity_model.pkl"

FEATURES = ['nitrogen', 'phosphorus', 'potassium', 'crop_type_enc', 'soil_type_enc',
            'n_deficiency', 'p_deficiency', 'k_deficiency']

_model_cache = {}


def _load_models():
    """Load trained ML models if available."""
    if "classifier" not in _model_cache:
        if CLASSIFIER_PATH.exists():
            data = joblib.load(CLASSIFIER_PATH)
            _model_cache["classifier"] = data.get("model", data)
            _model_cache["features"] = data.get("features", FEATURES)
        if LE_PATH.exists():
            _model_cache["le"] = joblib.load(LE_PATH)
        if QUANTITY_PATH.exists():
            _model_cache["quantity_model"] = joblib.load(QUANTITY_PATH)
    return _model_cache.get("classifier")


def _encode_features(soil_data: dict) -> pd.DataFrame:
    """Encode soil data for ML model input."""
    crop_map = {'Wheat': 0, 'Rice': 1, 'Maize': 2, 'Cotton': 3, 
                'Sugarcane': 4, 'Barley': 5, 'Millets': 6, 'Pulses': 7}
    soil_map = {'Loamy': 0, 'Clayey': 1, 'Sandy': 2, 'Saline': 3}
    
    def def_level(val, lo, hi):
        return 1 if val < lo else (2 if val < hi else 3)
    
    return pd.DataFrame([{
        'nitrogen': soil_data.get('nitrogen', 50),
        'phosphorus': soil_data.get('phosphorus', 25),
        'potassium': soil_data.get('potassium', 30),
        'crop_type_enc': 0,  # Default to Wheat
        'soil_type_enc': 0,  # Default to Loamy
        'n_deficiency': def_level(soil_data.get('nitrogen', 50), 40, 70),
        'p_deficiency': def_level(soil_data.get('phosphorus', 25), 20, 40),
        'k_deficiency': def_level(soil_data.get('potassium', 30), 30, 60),
    }])


def _predict_ml(soil_data: dict) -> list:
    """Predict fertilizer recommendations using ML model."""
    classifier = _load_models()
    if classifier is None:
        return None
    
    le = _model_cache.get("le")
    X = _encode_features(soil_data)
    
    # Predict fertilizer type
    fert_encoded = classifier.predict(X)[0]
    fert_name = le.inverse_transform([fert_encoded])[0] if le else str(fert_encoded)
    
    # Predict quantity if quantity model exists
    qty_model = _model_cache.get("quantity_model")
    if qty_model:
        qty = float(qty_model.predict(X)[0])
        qty_acre = f"{round(qty, 1)} kg/acre"
    else:
        qty_acre = "30-50 kg/acre"
    
    # Build type and notes
    fert_nutrient_map = {
        'Urea': ('Chemical', 'High nitrogen content. Apply in splits for better efficiency.'),
        'DAP': ('Chemical', 'Provides both N and P. Apply basal at sowing time.'),
        'MOP': ('Chemical', 'High potassium content. Best applied with irrigation.'),
        'SSP': ('Chemical', 'Also provides sulfur. Good for acidic soils.'),
        'NPK_Complex': ('Chemical', 'Balanced NPK. Convenient for general application.'),
        'Organic_Compost': ('Organic', 'Improves soil structure. Apply 2 weeks before sowing.'),
        'Vermicompost': ('Organic', 'Rich in micronutrients. Apply as basal.'),
        'Bone_meal': ('Organic', 'Slow-release phosphorus source.'),
        'Wood_ash': ('Organic', 'Also raises soil pH. Good for acidic soils.'),
    }
    
    fert_type, notes = fert_nutrient_map.get(fert_name, ('Chemical', 'Apply as per soil test recommendations.'))
    
    return [{
        "name": fert_name.replace('_', ' '),
        "quantity_per_acre": qty_acre,
        "type": fert_type,
        "notes": notes,
    }]


def get_recommendations() -> dict:
    """Generate fertilizer recommendations using ML (preferred) or rule-based logic."""
    soil_data = get_latest_soil_test()
    
    # Try ML model first
    ml_fertilizers = _predict_ml(soil_data)
    
    if ml_fertilizers is not None:
        fertilizers = ml_fertilizers
    else:
        fertilizers = recommend_fertilizers(soil_data)
    
    soil_summary = generate_soil_summary(soil_data)
    
    return {
        "crop": None,
        "fertilizers": fertilizers,
        "schedule": DEFAULT_SCHEDULE,
        "soil_summary": soil_summary,
    }

