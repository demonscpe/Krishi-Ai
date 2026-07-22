"""Crop prediction service - the ML + Gemini logic."""
import numpy as np
from services.ml_models import get_category_model
from services.openai_client import get_openai_insight

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


def _add_features(N, P, K, T, H, ph, R):
    return np.array([[
        N, P, K, T, H, ph, R,
        N / (P + 1),
        N / (K + 1),
        N + P + K,
        T * H / 100
    ]])


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

    # For non-field crops with low confidence, use Gemini
    if category != 'field_crops' and confidence < 70:
        gemini_pred = await _openai_category_predict(category, data)
        if gemini_pred:
            prediction = gemini_pred
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

