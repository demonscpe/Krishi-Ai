"""Chatbot router (RAG-powered using Groq)."""
from fastapi import APIRouter, HTTPException, Request
from schemas.chatbot import ChatRequest, ChatResponse, SourceInfo
from services.groq_client import get_chat_response
from utils.rate_limiter import rate_limiter

router = APIRouter(tags=["Chatbot"], prefix="/api")


async def _handle_chat(request: Request, data: ChatRequest) -> ChatResponse:
    ip = request.client.host if request.client else "unknown"
    if rate_limiter.is_limited(ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait and try again.")
    try:
        response_text, sources, has_context = await get_chat_response(data.prompt)
        source_infos = [
            SourceInfo(source=s["source"], heading=s["heading"], relevance=s["relevance"])
            for s in sources
        ]
        return ChatResponse(response=response_text, sources=source_infos, has_context=has_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chatbot", response_model=ChatResponse)
async def chatbot(request: Request, data: ChatRequest):
    """Chat with the Krishi-AI RAG Agent assistant."""
    return await _handle_chat(request, data)


@router.post("/chatbot/chat", response_model=ChatResponse)
async def chatbot_chat(request: Request, data: ChatRequest):
    """Chat with the Krishi-AI RAG Agent assistant (alias)."""
    return await _handle_chat(request, data)

