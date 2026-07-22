# Disease Chatbot Dataset

## Description
The disease chatbot uses the Gemini API (already configured in services/gemini_client.py)
to provide AI-powered plant disease advice. No training dataset is required for the chatbot
itself, as it uses an LLM with context-stuffed prompts.

## Knowledge Base
The chatbot builds a system prompt with:
- Current disease context (plant, disease, severity, treatment, prevention)
- Common agricultural knowledge about plant diseases
- User's question

## Future Enhancement
For RAG (Retrieval Augmented Generation), add:
- `agri_knowledge.md` — curated agronomic facts
- A vector store (e.g., ChromaDB) with indexed ICAR/FAO crop protection guides
- Retrieved context injected into the Gemini prompt

## How to Customize
Modify `service.py` to adjust the system prompt template or add retrieval.

