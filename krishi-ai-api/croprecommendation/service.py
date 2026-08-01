"""Consolidated crop prediction & recommendation service."""
import os
import pickle
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from services.openai_client import get_openai_insight

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
CSV_PATH = BASE_DIR / "Crop_recommendation.csv"

# ---- Crop category lists ----
CATEGORY_CROPS = {
    'field_crops': [
        'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
        'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
        'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
        'coconut', 'cotton', 'jute', 'coffee', 'wheat', 'sugarcane',
        'barley', 'tea', 'tobacco'
    ],
    'vegetables': [
        'tomato', 'potato', 'onion', 'garlic', 'carrot', 'cabbage',
        'broccoli', 'cauliflower', 'spinach', 'lettuce', 'cucumber',
        'pumpkin', 'radish', 'beetroot', 'okra', 'capsicum',
        'peas', 'beans', 'brinjal', 'chilli'
    ],
    'flowers': [
        'rose', 'lily', 'tulip', 'orchid', 'jasmine', 'marigold',
        'sunflower', 'lavender', 'petunia', 'gerbera', 'carnation',
        'poppy', 'dahlia', 'zinnia', 'chrysanthemum', 'gladiolus',
        'hollyhock', 'hibiscus', 'lotus', 'daisy'
    ],
}

# ---- Model cache ----
_models: dict = {}

# ---- Rotation mappings ----
PREVIOUS_CROP_MAPPING = {
    'Groundnut': 1, 'Millets': 2, 'Wheat': 3, 'Maize': 4,
    'Cotton': 5, 'Sorghum': 6, 'Barley': 7
}
SOIL_TYPE_MAPPING = {
    'Loamy': 1, 'Clayey': 2, 'Sandy': 3, 'Saline': 4
}
CROP_MAPPING = {
    1: 'Wheat', 2: 'Rice', 3: 'Millets', 4: 'Cotton',
    5: 'Groundnut', 6: 'Maize', 7: 'Sorghum', 8: 'Barley'
}


# ===========================
# Model Loading
# ===========================

def _load_pickle(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)


def _load_joblib(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


def get_category_model(category: str):
    """Load category-specific crop model."""
    key = f"crop_model_{category}"
    if key not in _models:
        model_path = MODEL_DIR / f"crop_model_{category}.pkl"
        le_path = MODEL_DIR / f"crop_le_{category}.pkl"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found for category: {category}")
        _models[key] = {
            "model": joblib.load(model_path),
            "le": joblib.load(le_path),
        }
    return _models[key]


def get_rotation_model():
    """Load crop rotation recommendation model (returns None if not available)."""
    key = "crop_rotation"
    path = MODEL_DIR / "crop_rotation_recommendation_model.pkl"
    if not path.exists():
        return None
    if key not in _models:
        _models[key] = joblib.load(path)
    return _models[key]


# ===========================
# Crop Prediction
# ===========================

def _add_features(N, P, K, T, H, ph, R):
    return pd.DataFrame([{
        'N': N, 'P': P, 'K': K,
        'temperature': T, 'humidity': H, 'ph': ph, 'rainfall': R,
        'N_P_ratio': N / (P + 1),
        'N_K_ratio': N / (K + 1),
        'NPK_sum':   N + P + K,
        'temp_hum':  T * H / 100,
    }])


async def predict_crop(data: dict) -> dict:
    """Predict the best crop based on soil parameters."""
    category = data.get('category', 'field_crops').lower().replace(' ', '_')
    model_data = get_category_model(category)
    model = model_data['model']
    le = model_data['le']

    N = float(data['Nitrogen'])
    P = float(data['Phosphorus'])
    K = float(data['Potassium'])
    T = float(data['Temperature'])
    H = float(data['Humidity'])
    ph = float(data['ph'])
    R = float(data['Rainfall'])

    features = _add_features(N, P, K, T, H, ph, R)
    proba = model.predict_proba(features)[0]
    top_indices = np.argsort(proba)[::-1][:4]
    classes = le.classes_

    prediction = classes[top_indices[0]]
    confidence = round(float(proba[top_indices[0]]) * 100, 2)
    alternatives = [
        {'crop': classes[i], 'confidence': round(float(proba[i]) * 100, 2)}
        for i in top_indices[1:]
    ]

    # For non-field crops with low confidence, use OpenAI
    if category != 'field_crops' and confidence < 70:
        openai_pred = await _openai_category_predict(category, data)
        if openai_pred:
            prediction = openai_pred
            confidence = None
            alternatives = []

    ai_insight = await get_openai_insight(prediction, confidence, data)

    return {
        'Prediction': prediction,
        'Confidence': confidence,
        'Alternatives': alternatives,
        'AIInsight': ai_insight,
        'Category': category,
        'Source': 'ML' if confidence else 'AI',
    }


async def _openai_category_predict(category: str, data: dict) -> str | None:
    """Use OpenAI to predict the best crop from category list."""
    try:
        from services.openai_client import get_client
        client = get_client()
        crops_list = ', '.join(CATEGORY_CROPS.get(category, []))
        prompt = f"""You are an expert horticulturist. Based on the soil and climate data below, pick the SINGLE best crop to grow from this list: {crops_list}

Soil & Climate Data:
- Nitrogen: {data['Nitrogen']} kg/ha
- Phosphorus: {data['Phosphorus']} kg/ha
- Potassium: {data['Potassium']} kg/ha
- Temperature: {data['Temperature']}°C
- Humidity: {data['Humidity']}%
- pH: {data['ph']}
- Rainfall: {data['Rainfall']} mm

Reply with ONLY the crop name from the list, nothing else."""
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return (response.choices[0].message.content or "").strip().lower()
    except Exception:
        return None


# ===========================
# Crop Recommendation (Rotation)
# ===========================

# Rule-based fallback when the rotation model file is unavailable
ROTATION_FALLBACK = {
    "Rice": "Chickpea", "Wheat": "Soybean", "Maize": "Chickpea",
    "Cotton": "Wheat", "Groundnut": "Wheat", "Sorghum": "Chickpea",
    "Barley": "Mustard", "Millets": "Wheat",
}


async def recommend_crop(data: dict) -> dict:
    """Recommend a crop based on previous crop and soil data."""
    model = get_rotation_model()
    prev_crop = data.get("Previous Crop", "")

    # Graceful fallback when no trained rotation model is deployed
    if model is None:
        return {"Recommended Crop": ROTATION_FALLBACK.get(prev_crop, "Wheat")}

    input_data = pd.DataFrame([{
        "Previous Crop": PREVIOUS_CROP_MAPPING.get(prev_crop, -1),
        "Soil Type": SOIL_TYPE_MAPPING.get(data.get("Soil Type"), -1),
        "Moisture Level": data.get("Moisture Level"),
        "Nitrogen (N)": data.get("Nitrogen (N)"),
        "Phosphorus (P)": data.get("Phosphorus (P)"),
        "Potassium (K)": data.get("Potassium (K)")
    }])

    prediction = model.predict(input_data)
    crop = CROP_MAPPING.get(prediction[0], "No prediction available")
    return {"Recommended Crop": crop}


# ===========================
# Model Accuracy Evaluation
# ===========================

def evaluate_accuracy(category: str = None) -> dict:
    """
    Evaluate model accuracy on the Crop_recommendation.csv dataset.
    Returns per-category and overall metrics.
    """
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    df = df.dropna()

    FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

    if category and category not in CATEGORY_CROPS:
        raise ValueError(f"Unknown category: {category}. Valid: {list(CATEGORY_CROPS.keys())}")

    categories_to_eval = [category] if category else list(CATEGORY_CROPS.keys())
    per_category = []
    total_all = 0
    correct_all = 0

    for cat in categories_to_eval:
        crops = CATEGORY_CROPS[cat]
        subset = df[df['label'].isin(crops)]
        if subset.empty:
            continue

        try:
            model_data = get_category_model(cat)
        except FileNotFoundError:
            continue

        model = model_data['model']
        le = model_data['le']

        X = subset[FEATURES].copy()
        # Add engineered features
        X['N_P_ratio'] = X['N'] / (X['P'] + 1)
        X['N_K_ratio'] = X['N'] / (X['K'] + 1)
        X['NPK_sum'] = X['N'] + X['P'] + X['K']
        X['temp_hum'] = X['temperature'] * X['humidity'] / 100

        y_true = le.transform(subset['label'])
        y_pred = model.predict(X)

        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_true, y_pred, average='weighted', zero_division=0)
        misclassified = int((y_true != y_pred).sum())

        per_category.append({
            'category': cat,
            'accuracy': round(float(acc), 4),
            'precision': round(float(prec), 4),
            'recall': round(float(rec), 4),
            'f1_score': round(float(f1), 4),
            'total_samples': len(subset),
            'misclassified': misclassified,
        })

        total_all += len(subset)
        correct_all += int((y_true == y_pred).sum())

    overall_acc = round(correct_all / total_all, 4) if total_all else 0.0

    return {
        'overall_accuracy': overall_acc,
        'per_category': per_category,
        'total_samples': total_all,
    }

