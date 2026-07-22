"""OpenAI client for location services and AI insights."""
import re
import json
from openai import AsyncOpenAI
from config import OPENAI_API_KEY

_client = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


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


def extract_json(text: str) -> str | None:
    json_pattern = r'\{.*\}|\[.*\]'
    match = re.search(json_pattern, text, re.DOTALL)
    return match.group(0) if match else None


async def get_openai_response(location: str, prompt_type: str = "soil") -> tuple[str | None, str | None]:
    """Returns (json_data, error_message)."""
    try:
        client = get_client()
        prompt = SOIL_LAB_PROMPT if prompt_type == "soil" else EE_SHOP_PROMPT
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt + location}]
        )
        response_text = response.choices[0].message.content or ""
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


async def get_openai_insight(crop: str, confidence: float | None, data: dict) -> str | None:
    """Get AI agronomic insight for a crop prediction."""
    try:
        client = get_client()
        conf_text = f"{confidence:.1f}%" if confidence else "AI-selected"
        prompt = f"""You are an expert agricultural advisor. A farmer's soil and climate data was analyzed.

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

Be practical and farmer-friendly. No bullet points, just plain paragraphs."""
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        return f"AI insight unavailable: {str(e)}"
