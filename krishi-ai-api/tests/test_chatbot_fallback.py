import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import services.groq_client as groq_client


def test_returns_fallback_when_no_llm_key(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("OPENROUTER_API_KEY", "")
    monkeypatch.setattr(groq_client, "GROQ_API_KEY", "", raising=False)
    monkeypatch.setattr(groq_client, "OPENROUTER_API_KEY", "", raising=False)

    response, sources, has_context = asyncio.run(groq_client.get_chat_response("What is Krishi-AI?"))

    assert isinstance(response, str) and response.strip()
    assert isinstance(sources, list)
    assert isinstance(has_context, bool)


def test_blocks_unrelated_topics(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "")
    monkeypatch.setenv("OPENROUTER_API_KEY", "")
    monkeypatch.setattr(groq_client, "GROQ_API_KEY", "", raising=False)
    monkeypatch.setattr(groq_client, "OPENROUTER_API_KEY", "", raising=False)

    response, sources, has_context = asyncio.run(groq_client.get_chat_response("What is blockchain?"))

    assert "agriculture and farming only" in response.lower()
    assert isinstance(sources, list)
    assert isinstance(has_context, bool)
