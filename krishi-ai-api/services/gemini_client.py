"""Google Gemini AI client for location services and AI insights."""
import re
import json
import google.generativeai as genai
from config import GOOGLE_API_KEY

# Initialize Gemini
genai.configure(api_key=GOOGLE_API_KEY)

SOIL_LAB_PROMPT = (
    "As an expert in location-based services and geospatial data, your task is to provide a precise and accurate list of nearby soil testing labs "
    "for the specified location. Please return the response in a well-structured JSON format. "
    "Each entry should include the lab's name, latitude, longitude, and a direct Google Maps link for easy navigation. "
)

EE_SHOP_PROMPT = (
    "As an expert in location-based services and geospatial data, your task is to provide a precise and accurate list of nearby electrical and electronics shops "
    "for the specified location. Please return the response in a well-structured JSON format. "
    "Each entry should include the shop's name, latitude, longitude, and a direct Google Maps link for easy navigation. "
)

_gemini_model = None
_gemini_chat = None


def get_model():
    global _gemini_model, _gemini_chat
    if _gemini_model is None:
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash-lite")
        _gemini_chat = _gemini_model.start_chat(history=[])
    return _gemini_model, _gemini_chat


def extract_json(text: str) -> str | None:
    json_pattern = r'\{.*\}|\[.*\]'
    match = re.search(json_pattern, text, re.DOTALL)
    return match.group(0) if match else None


async def get_gemini_response(location: str, prompt_type: str = "soil") -> tuple[str | None, str | None]:
    """
    Returns (json_data, error_message).
    """
    try:
        _, chat = get_model()
        prompt = SOIL_LAB_PROMPT if prompt_type == "soil" else EE_SHOP_PROMPT
        full_prompt = prompt + location
        response = chat.send_message(full_prompt, stream=True)

        response_text = ""
        for chunk in response:
            response_text += chunk.text

        json_data = extract_json(response_text)
        if json_data:
            try:
                parsed = json.loads(json_data)
                return parsed, None
            except json.JSONDecodeError:
                return None, "Error decoding the JSON data from AI response."
        return None, "No valid JSON found in the AI response."
    except Exception as e:
        return None, str(e)


async def get_gemini_insight(crop: str, confidence: float | None, data: dict) -> str | None:
    """Get AI agronomic insight for a crop prediction."""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
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
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"AI insight unavailable: {str(e)}"

