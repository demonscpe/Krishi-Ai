"""Groq LLM client for the chatbot endpoint with RAG support.
Primary provider: OpenRouter (multi-model fallback)
Fallback provider: Groq
"""
import logging
from typing import List, Dict, Tuple
from groq import Groq
from config import get_env_var
from services.rag_service import get_rag_response

logger = logging.getLogger(__name__)

_client = None


def get_client() -> Groq | None:
    global _client
    api_key = get_env_var("GROQ_API_KEY")
    if not api_key:
        return None
    if _client is None:
        _client = Groq(api_key=api_key)
    return _client


def _build_system_prompt(context: str = "", has_context: bool = False) -> str:
    """Build the system prompt with optional RAG context."""
    base_prompt = (
        "You are Krishi-AI, an agricultural assistant built for farmers and agri professionals. "
        "You must answer only about agriculture, farming, crops, soil, irrigation, disease management, market information, and Krishi-AI platform features. "
        "Do not answer unrelated questions such as math, physics, or general theory.\n\n"
        "Your personality: friendly, practical, concise, and farmer-focused. "
        "Speak in simple language. If the user asks about the platform creator or developer, answer that the Krishi-AI assistant is developed by the Krishi-AI team and that Rajesh is associated with the project in the way the user described.\n\n"
        "Guidelines:\n"
        "1. Stay focused on agriculture and farm-related help only\n"
        "2. If the question is unrelated to farming, gently redirect to agriculture\n"
        "3. Prefer practical, actionable advice for farmers\n"
        "4. If you do not know something, say so clearly and suggest where to check\n"
        "5. Keep responses short and easy to follow\n"
        "6. When discussing disease, nutrition, soil, or pesticides, prioritize safe and sustainable practices\n"
        "7. If the user asks about unrelated topics such as blockchain, math, physics, or general technology, respond: 'Sorry, that topic is not related to my work. I can help with agriculture and farming only.'\n"
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


def _build_fallback_response(context: str, sources: List[Dict], has_context: bool) -> Tuple[str, List[Dict], bool]:
    """Return a useful knowledge-base-only response when the live LLM provider is unavailable."""
    if context:
        fallback_text = (
            "I couldn't reach the live AI provider right now, but I found the most relevant information from the Krishi-AI knowledge base:\n\n"
            f"{context[:1800]}"
        )
    else:
        fallback_text = (
            "I can help with agriculture, farming, crops, soil, irrigation, disease management, and Krishi-AI platform support. "
            "Please ask something related to farming and I will assist you."
        )
    return fallback_text, sources, has_context


async def get_chat_response(user_prompt: str) -> Tuple[str, List[Dict], bool]:
    """
    Get a response from the chatbot using RAG.
    Primary provider: OpenRouter (tries multiple free models)
    Fallback provider: Groq (llama-3.1-8b-instant)
    
    Returns:
        Tuple of (response_text, sources_list, has_context_flag)
    """
    context, sources = get_rag_response(user_prompt)
    has_context = len(sources) > 0

    # --- Try OpenRouter first (multiple models) ---
    if get_env_var("OPENROUTER_API_KEY"):
        try:
            from services.openrouter_client import get_chat_response_with_fallback as openrouter_fallback
            logger.info("Attempting OpenRouter first (with multi-model fallback)...")
            result = await openrouter_fallback(user_prompt)
            if result is not None:
                return result
            logger.warning("OpenRouter failed, falling back to the local agriculture knowledge base...")
        except Exception as e:
            logger.warning(f"OpenRouter failed, falling back to the local agriculture knowledge base: {e}")

    # --- Fallback to Groq ---
    if get_env_var("GROQ_API_KEY"):
        system_prompt = _build_system_prompt(context, has_context)
        try:
            client = get_client()
            if client is None:
                return _build_fallback_response(context, sources, has_context)
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
            logger.warning(f"Groq API error: {str(e)}")

    return _build_fallback_response(context, sources, has_context)

