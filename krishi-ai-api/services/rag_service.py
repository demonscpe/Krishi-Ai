"""
RAG (Retrieval-Augmented Generation) Service for Krishi-AI Chatbot.
Uses TF-IDF vectorization to retrieve relevant knowledge base documents.
"""
import os
import glob
import logging
from pathlib import Path
from typing import List, Dict, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from config import BASE_DIR

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"

# Global cached resources
_vectorizer = None
_tfidf_matrix = None
_document_chunks: List[Dict[str, str]] = []
_chunk_sources: List[str] = []


def _load_knowledge_base() -> List[Dict[str, str]]:
    """Load all markdown files from the knowledge base directory."""
    chunks = []
    md_files = glob.glob(str(KNOWLEDGE_BASE_DIR / "*.md"))
    
    if not md_files:
        logger.warning(f"No markdown files found in {KNOWLEDGE_BASE_DIR}")
        return chunks

    for filepath in sorted(md_files):
        filename = Path(filepath).stem
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Failed to read {filepath}: {e}")
            continue

        # Split into sections by ## headings
        sections = content.split("\n## ")
        for section in sections:
            if not section.strip():
                continue
            # Extract heading
            lines = section.strip().split("\n")
            heading = lines[0].strip().replace("## ", "").replace("# ", "")
            body = "\n".join(lines[1:]).strip()
            
            if body:
                chunk_text = f"{heading}\n{body}" if heading else body
                chunks.append({
                    "text": chunk_text,
                    "source": filename,
                    "heading": heading,
                })
    
    logger.info(f"Loaded {len(chunks)} chunks from {len(md_files)} knowledge base files")
    return chunks


def _initialize_rag():
    """Initialize or re-initialize the RAG vectorizer and matrix."""
    global _vectorizer, _tfidf_matrix, _document_chunks, _chunk_sources
    
    _document_chunks = _load_knowledge_base()
    
    if not _document_chunks:
        _vectorizer = None
        _tfidf_matrix = None
        _chunk_sources = []
        return
    
    texts = [chunk["text"] for chunk in _document_chunks]
    _chunk_sources = [f"{chunk['source']}: {chunk['heading']}" for chunk in _document_chunks]
    
    _vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        ngram_range=(1, 2),
    )
    _tfidf_matrix = _vectorizer.fit_transform(texts)
    logger.info(f"RAG initialized with {len(texts)} chunks, vocab size: {_vectorizer.get_feature_names_out().shape[0]}")


def retrieve_context(query: str, top_k: int = 3) -> Tuple[str, List[Dict]]:
    """
    Retrieve the most relevant context from the knowledge base for a given query.
    
    Args:
        query: The user's question
        top_k: Number of top chunks to retrieve
        
    Returns:
        Tuple of (combined_context_string, list_of_source_dicts)
    """
    if _vectorizer is None or _tfidf_matrix is None:
        _initialize_rag()
    
    if not _document_chunks:
        logger.warning("Knowledge base is empty, no context available")
        return "", []
    
    try:
        query_vec = _vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, _tfidf_matrix).flatten()
        
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        context_parts = []
        sources = []
        
        for idx in top_indices:
            if similarities[idx] > 0.05:  # Filter out very low similarity
                chunk = _document_chunks[idx]
                context_parts.append(chunk["text"])
                sources.append({
                    "source": chunk["source"],
                    "heading": chunk["heading"],
                    "relevance": float(round(similarities[idx], 3)),
                })
        
        combined_context = "\n\n---\n\n".join(context_parts)
        return combined_context, sources
        
    except Exception as e:
        logger.error(f"RAG retrieval error: {e}")
        return "", []


def get_rag_response(user_query: str) -> Tuple[str, List[Dict]]:
    """
    Get context from RAG and format the augmented prompt.
    
    Returns:
        Tuple of (context_string, sources_list)
    """
    context, sources = retrieve_context(user_query)
    
    if not context:
        logger.info(f"No relevant context found for query: {user_query[:50]}...")
    
    return context, sources


# Initialize on import
_initialize_rag()

