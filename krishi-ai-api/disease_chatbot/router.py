"""Disease chatbot router."""
from fastapi import APIRouter, HTTPException
from disease_chatbot.schemas import DiseaseChatbotRequest, DiseaseChatbotResponse
from disease_chatbot.service import chat_with_plant_doctor

router = APIRouter(prefix="/api/disease-chatbot", tags=["Disease Chatbot"])


@router.post("", response_model=DiseaseChatbotResponse)
async def disease_chatbot(data: DiseaseChatbotRequest):
    """Chat with AI Plant Doctor about plant diseases."""
    try:
        reply = await chat_with_plant_doctor(data.message, data.context)
        return DiseaseChatbotResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
