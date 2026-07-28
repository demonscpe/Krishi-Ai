"""Disease chatbot service using Groq API."""
from services.groq_client import get_client


async def chat_with_plant_doctor(message: str, context: dict) -> str:
    """Send message to Groq AI with plant disease context."""
    try:
        plant = context.get("plant", "unknown plant")
        disease = context.get("disease", "unknown disease")

        system_prompt = (
            f"You are 'AI Plant Doctor', an expert agricultural plant pathologist.\n"
            f"Context: Plant/Crop: {plant}, Detected Disease: {disease}\n"
            "Answer the farmer's question with practical advice about symptoms, treatment, prevention, and prognosis. "
            "Be friendly and concise (2-4 paragraphs)."
        )

        client = get_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            temperature=0.7,
            max_tokens=512,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"I'm sorry, I'm having trouble connecting. Please try again later. (Error: {str(e)})"
