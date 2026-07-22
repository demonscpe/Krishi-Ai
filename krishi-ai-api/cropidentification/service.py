"""Crop identification service — uses Groq/OpenAI vision to identify crops from images."""
import base64
from pathlib import Path

CROP_DESCRIPTIONS = {
    "rice": "Staple cereal crop grown in flooded paddies. Kharif season.",
    "wheat": "Rabi cereal crop. Grows in cool, dry climates.",
    "maize": "Kharif cereal. Tall stalks with cobs. High yield.",
    "cotton": "Kharif cash crop. White fluffy bolls at maturity.",
    "sugarcane": "Tall perennial grass. Kharif. Used for sugar production.",
    "tomato": "Warm-season vegetable. Red/yellow fruits on vines.",
    "potato": "Cool-season tuber crop. Underground starchy tubers.",
    "onion": "Bulb vegetable. Rabi season. Pungent smell.",
    "soybean": "Legume. Kharif. Nitrogen-fixing. High protein seeds.",
    "groundnut": "Legume. Kharif. Underground pods with oil-rich seeds.",
}


def _encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


async def identify_from_image(image_bytes: bytes, filename: str) -> dict:
    """Identify crop from image using AI vision."""
    b64 = _encode_image(image_bytes)
    ext = Path(filename).suffix.lower().lstrip(".")
    mime = f"image/{ext}" if ext in ("jpg", "jpeg", "png", "webp") else "image/jpeg"

    prompt = (
        "You are an expert agronomist. Identify the crop in this image. "
        "Reply in JSON: {\"crop\": \"<name>\", \"confidence\": <0-100>, "
        "\"description\": \"<one sentence>\", "
        "\"alternatives\": [{\"crop\": \"<name>\", \"confidence\": <0-100>}]}"
    )

    import json

    # Try OpenAI vision first (AsyncOpenAI supports vision)
    try:
        from services.openai_client import get_client
        client = get_client()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            }],
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        return {
            "crop_name": data.get("crop", "Unknown"),
            "confidence": data.get("confidence"),
            "description": data.get("description") or CROP_DESCRIPTIONS.get(data.get("crop", "").lower()),
            "alternatives": data.get("alternatives", []),
            "source": "OpenAI",
        }
    except Exception as e:
        raise RuntimeError(f"Crop identification failed: {e}")
