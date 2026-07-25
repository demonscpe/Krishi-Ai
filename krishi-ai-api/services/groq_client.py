"""Groq LLM client for the chatbot endpoint with RAG support."""
import os
from groq import Groq
from typing import List, Dict, Tuple
from config import GROQ_API_KEY
from services.rag_service import get_rag_response

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        os.environ["GROQ_API_KEY"] = GROQ_API_KEY
        _client = Groq()
    return _client


def _build_system_prompt(context: str = "", has_context: bool = False) -> str:
    """Build the system prompt with optional RAG context."""
    base_prompt = (
        "You are Krishi-AI, an intelligent agricultural assistant for the Krishi-AI platform. "
        "Your role is to help farmers and agricultural professionals with accurate, practical information "
        "about farming practices, crop management, soil health, disease detection, and all Krishi-AI platform features.\n\n"
        "Guidelines:\n"
        "1. Be helpful, concise, and farmer-friendly\n"
        "2. Provide specific, actionable advice when asked about farming practices\n"
        "3. If asked about platform features, explain clearly how to access them\n"
        "4. If you don't know something, say so honestly\n"
        "5. Keep responses to 2-4 paragraphs unless more detail is requested\n"
        "6. When discussing diseases, treatments, or farming practices, prioritize safe and sustainable methods\n"
    )

    if has_context and context:
        base_prompt += (
            "\n\n--- RELEVANT KNOWLEDGE BASE CONTEXT ---\n"
            "The following information from the Krishi-AI knowledge base is relevant to the user's question. "
            "Use it to provide accurate, platform-specific answers:\n\n"
            f"{context}\n\n"
            "--- END OF CONTEXT ---\n"
        )

    return base_prompt


async def get_chat_response(user_prompt: str) -> Tuple[str, List[Dict], bool]:
    """
    Get a response from the chatbot using RAG.
    
    Returns:
        Tuple of (response_text, sources_list, has_context_flag)
    """
    # Retrieve RAG context
    context, sources = get_rag_response(user_prompt)
    has_context = len(sources) > 0

    # Build system prompt with context
    system_prompt = _build_system_prompt(context, has_context)

    try:
        client = get_client()
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        assistant_response = response.choices[0].message.content
        return assistant_response, sources, has_context
        
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

