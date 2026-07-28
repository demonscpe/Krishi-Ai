"""
OpenRouter LLM client for the chatbot endpoint with RAG support.
Uses OpenAI-compatible SDK pointed at OpenRouter's API endpoint.
"""
import logging
from typing import List, Dict, Tuple
from openai import OpenAI
from config import get_env_var
from services.rag_service import get_rag_response

logger = logging.getLogger(__name__)

# OpenRouter configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_REFERER = "https://krishi-ai.vercel.app"
OPENROUTER_TITLE = "Krishi-AI"

# Default model
DEFAULT_MODEL = "openai/gpt-4o-mini"

_client = None


def get_client() -> OpenAI | None:
    """Get or create the OpenRouter OpenAI-compatible client."""
    global _client
    api_key = get_env_var("OPENROUTER_API_KEY")
    if not api_key:
        return None
    if _client is None:
        _client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
            default_headers={
                "HTTP-Referer": OPENROUTER_REFERER,
                "X-Title": OPENROUTER_TITLE,
            }
        )
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


async def get_chat_response(user_prompt: str, model: str = DEFAULT_MODEL) -> Tuple[str, List[Dict], bool]:
    """
    Get a response from the chatbot using RAG + OpenRouter with a single model.
    
    Returns:
        Tuple of (response_text, sources_list, has_context_flag)
    """
    context, sources = get_rag_response(user_prompt)
    has_context = len(sources) > 0
    system_prompt = _build_system_prompt(context, has_context)

    try:
        client = get_client()
        if client is None:
            return None

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        assistant_response = response.choices[0].message.content
        return assistant_response, sources, has_context

    except Exception as e:
        logger.error(f"OpenRouter API error with model {model}: {str(e)}")
        raise Exception(f"OpenRouter API error: {str(e)}")


async def get_chat_response_with_fallback(user_prompt: str) -> Tuple[str, List[Dict], bool]:
    """
    Get a response using OpenRouter first, trying multiple models in sequence.
    Does NOT fall back to Groq (to avoid circular imports when called from groq_client).
    Returns None if all models fail.
    """
    models_to_try = [
        "openai/gpt-4o-mini",
        "meta-llama/llama-3.3-70b-instruct",
        "mistralai/mistral-small-3.1-24b-instruct:free",
    ]
    
    for model in models_to_try:
        try:
            logger.info(f"Trying OpenRouter model: {model}")
            return await get_chat_response(user_prompt, model=model)
        except Exception as e:
            logger.warning(f"OpenRouter model {model} failed: {e}")
            continue
    
    # All OpenRouter models failed
    return None

