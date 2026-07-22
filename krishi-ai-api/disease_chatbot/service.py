"""Disease chatbot service using Gemini API."""
from services.gemini_client import get_model


async def chat_with_plant_doctor(message: str, context: dict) -> str:
    """Send message to Gemini AI with plant disease context."""
    try:
        plant = context.get("plant", "unknown plant")
        disease = context.get("disease", "unknown disease")

        system_prompt = f"""You are 'AI Plant Doctor', an expert agricultural plant pathologist and botanist.
A farmer has a plant health concern.

Current context:
- Plant/Crop: {plant}
- Detected Disease: {disease}

Answer the farmer's question with practical, science-backed advice about:
- Symptoms and identification
- Treatment options (chemical and organic)
- Prevention methods
- Severity and prognosis
- Any other plant health topics

Be friendly, educational, and concise (2-4 paragraphs). Avoid generic advice.
"""

        model, chat = get_model()
        full_prompt = f"{system_prompt}\n\nFarmer's question: {message}"
        response = chat.send_message(full_prompt)
        return response.text.strip()

    except Exception as e:
        return f"I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later. (Error: {str(e)})"
