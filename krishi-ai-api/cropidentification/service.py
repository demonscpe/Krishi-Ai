"""Crop identification service — uses OpenRouter/Groq/Gemini vision to identify crops from images and provide farming advice."""
import base64
import json
import logging
from pathlib import Path

from config import get_env_var

logger = logging.getLogger(__name__)

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


async def _call_openai_vision(prompt: str, b64: str, mime: str) -> dict:
    """Call OpenAI/OpenRouter vision model to identify crop."""
    from services.openrouter_client import get_client as get_or_client
    client = get_or_client()
    if client is None:
        raise RuntimeError("OPENROUTER_API_KEY is not configured on the server.")
    
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ],
        }],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def _call_groq_vision(prompt: str, b64: str, mime: str) -> dict:
    """Fallback: Call Groq vision model."""
    from groq import Groq
    api_key = get_env_var("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.2-11b-vision-preview",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ],
        }],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


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

    # Try OpenRouter first (OpenAI-compatible)
    try:
        data = await _call_openai_vision(prompt, b64, mime)
        return {
            "crop_name": data.get("crop", "Unknown"),
            "confidence": data.get("confidence"),
            "description": data.get("description") or CROP_DESCRIPTIONS.get(data.get("crop", "").lower()),
            "alternatives": data.get("alternatives", []),
            "source": "OpenAI",
        }
    except Exception as e:
        logger.warning(f"OpenRouter vision failed: {e}")

    # Try Groq as fallback
    try:
        data = await _call_groq_vision(prompt, b64, mime)
        return {
            "crop_name": data.get("crop", "Unknown"),
            "confidence": data.get("confidence"),
            "description": data.get("description") or CROP_DESCRIPTIONS.get(data.get("crop", "").lower()),
            "alternatives": data.get("alternatives", []),
            "source": "Groq",
        }
    except Exception as e:
        logger.warning(f"Groq vision failed: {e}")

    raise RuntimeError("Crop identification failed: all AI providers are unavailable. Check your API keys.")


async def get_chat_response(message: str, crop_context: str) -> str:
    """Get farming advice response using OpenRouter with fallback to Groq/Gemini."""
    context = crop_context or "No crop has been identified yet."

    # Try OpenRouter first
    try:
        from services.openrouter_client import get_client as get_or_client
        client = get_or_client()
        if client:
            response = client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a practical farming advisor for the Krishi-AI platform. "
                            "Give concise, cautious guidance about crops, diseases, soil, fertilizer, pest management, "
                            "and farming practices. Mention when local agricultural-extension advice is needed. "
                            "Keep responses to 2-4 paragraphs."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Crop context:\n{context}\n\nQuestion:\n{message}",
                    },
                ],
                max_tokens=800,
            )
            result = response.choices[0].message.content
            if result:
                return result
    except Exception as e:
        logger.warning(f"OpenRouter chat failed: {e}")

    # Fallback to Groq
    try:
        from groq import Groq
        api_key = get_env_var("GROQ_API_KEY")
        if api_key:
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a practical farming advisor for the Krishi-AI platform. "
                            "Give concise, cautious guidance about crops, diseases, soil, fertilizer, pest management, "
                            "and farming practices."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Crop context:\n{context}\n\nQuestion:\n{message}",
                    },
                ],
                max_tokens=800,
            )
            result = response.choices[0].message.content
            if result:
                return result
    except Exception as e:
        logger.warning(f"Groq chat failed: {e}")

    # Final fallback to Gemini
    try:
        import google.generativeai as genai
        api_key = get_env_var("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content(
                f"You are a practical farming advisor. Context: {context}\n\nQuestion: {message}"
            )
            if response.text:
                return response.text
    except Exception as e:
        logger.warning(f"Gemini chat failed: {e}")

    raise RuntimeError(
        "All AI providers are unavailable. Please check your API keys "
        "(OPENROUTER_API_KEY, GROQ_API_KEY, or GOOGLE_API_KEY)."
    )
