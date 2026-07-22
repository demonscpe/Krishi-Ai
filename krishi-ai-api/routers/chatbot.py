"""Chatbot router (Groq-powered)."""
from fastapi import APIRouter, HTTPException, Request
from schemas.chatbot import ChatRequest, ChatResponse
from services.groq_client import get_chat_response
from utils.rate_limiter import rate_limiter

router = APIRouter(tags=["Chatbot"], prefix="/api")


@router.post("/chatbot", response_model=ChatResponse)
async def chatbot(request: Request, data: ChatRequest):
    """Chat with the AgroTech AI assistant."""
    # Rate limiting
    ip = request.client.host if request.client else "unknown"
    if rate_limiter.is_limited(ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait and try again.")

    try:
        response = await get_chat_response(data.prompt)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

