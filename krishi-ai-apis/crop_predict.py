import numpy as np
import joblib
import os
import google.generativeai as genai

_models = {}

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

def _load(category):
    if category not in _models:
        model_path = f'./models/crop_model_{category}.pkl'
        le_path    = f'./models/crop_le_{category}.pkl'
        if not os.path.exists(model_path):
            raise FileNotFoundError(f'Model not found for: {category}. Run train_crop_model.py first.')
        _models[category] = {
            'model': joblib.load(model_path),
            'le':    joblib.load(le_path),
        }
    return _models[category]['model'], _models[category]['le']

def _add_features(N, P, K, T, H, ph, R):
    return np.array([[
        N, P, K, T, H, ph, R,
        N / (P + 1),
        N / (K + 1),
        N + P + K,
        T * H / 100
    ]])

def predict_crop(data: dict) -> dict:
    category = data.get('category', 'field_crops').lower().replace(' ', '_')
    model, le = _load(category)

    N  = float(data['Nitrogen'])
    P  = float(data['Phosphorus'])
    K  = float(data['Potassium'])
    T  = float(data['Temperature'])
    H  = float(data['Humidity'])
    ph = float(data['ph'])
    R  = float(data['Rainfall'])

    features    = _add_features(N, P, K, T, H, ph, R)
    proba       = model.predict_proba(features)[0]
    top_indices = np.argsort(proba)[::-1][:4]
    classes     = le.classes_

    prediction  = classes[top_indices[0]]
    confidence  = round(float(proba[top_indices[0]]) * 100, 2)
    alternatives = [
        {'crop': classes[i], 'confidence': round(float(proba[i]) * 100, 2)}
        for i in top_indices[1:]
    ]

    # For flowers/vegetables with low confidence, let Gemini re-predict
    if category != 'field_crops' and confidence < 70:
        gemini_pred = _gemini_predict(category, data)
        if gemini_pred:
            prediction  = gemini_pred
            confidence  = None   # Gemini doesn't give a numeric confidence
            alternatives = []

    ai_insight = _gemini_insight(prediction, confidence, data)

    return {
        'Prediction':   prediction,
        'Confidence':   confidence,
        'Alternatives': alternatives,
        'AIInsight':    ai_insight,
        'Category':     category,
        'Source':       'ML' if confidence else 'AI',
    }


def _gemini_predict(category: str, data: dict) -> str:
    """Ask Gemini to pick the best crop from the category crop list."""
    try:
        crops_list = ', '.join(CATEGORY_CROPS.get(category, []))
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
You are an expert horticulturist. Based on the soil and climate data below, pick the SINGLE best crop to grow from this list: {crops_list}

Soil & Climate Data:
- Nitrogen: {data['Nitrogen']} kg/ha
- Phosphorus: {data['Phosphorus']} kg/ha
- Potassium: {data['Potassium']} kg/ha
- Temperature: {data['Temperature']}°C
- Humidity: {data['Humidity']}%
- pH: {data['ph']}
- Rainfall: {data['Rainfall']} mm

Reply with ONLY the crop name from the list, nothing else.
"""
        response = gemini_model.generate_content(prompt)
        return response.text.strip().lower()
    except Exception:
        return None


def _gemini_insight(crop: str, confidence, data: dict) -> str:
    try:
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        conf_text = f"{confidence:.1f}%" if confidence else "AI-selected"
        prompt = f"""
You are an expert agricultural advisor. A farmer's soil and climate data was analyzed.

Recommended crop: {crop} (confidence: {conf_text})
Category: {data.get('category', 'field_crops')}
Soil & Climate Data:
- Nitrogen: {data['Nitrogen']} kg/ha
- Phosphorus: {data['Phosphorus']} kg/ha
- Potassium: {data['Potassium']} kg/ha
- Temperature: {data['Temperature']}°C
- Humidity: {data['Humidity']}%
- pH: {data['ph']}
- Rainfall: {data['Rainfall']} mm

Give a concise 3-4 sentence explanation of:
1. Why {crop} suits these conditions
2. One key risk or challenge to watch for
3. One actionable tip to maximize yield

Be practical and farmer-friendly. No bullet points, just plain paragraphs.
"""
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI insight unavailable: {str(e)}"
