"""Application configuration & model paths."""
import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent


def _load_env_files() -> None:
    """Load environment variables from .env files in common project locations."""
    candidates = [
        BASE_DIR / ".env",
        BASE_DIR.parent / ".env",
        BASE_DIR.parent.parent / ".env",
    ]

    for candidate in candidates:
        if candidate.exists():
            load_dotenv(candidate, override=False)

    load_dotenv(override=False)


_load_env_files()


def get_env_var(name: str, default: str = "") -> str:
    """Read an environment variable while tolerating empty or whitespace values."""
    value = os.getenv(name, default)
    if isinstance(value, str):
        return value.strip()
    return default


# Model directories
MODEL_DIR = BASE_DIR / "models"
CROP_DATA_DIR = BASE_DIR / "crops"
UPLOAD_DIR = BASE_DIR / "uploads"

# Ensure upload dir exists
UPLOAD_DIR.mkdir(exist_ok=True)

# API Keys
OPENAI_API_KEY = get_env_var("OPENAI_API_KEY")
GROQ_API_KEY = get_env_var("GROQ_API_KEY")
GOOGLE_API_KEY = get_env_var("GOOGLE_API_KEY")
OPENROUTER_API_KEY = get_env_var("OPENROUTER_API_KEY")

# Server
HOST = get_env_var("HOST", "0.0.0.0")
PORT = int(get_env_var("PORT", "8000"))

# CORS
CORS_ORIGINS = get_env_var("CORS_ORIGINS", "*")

# Rate limiting
CHAT_RATE_LIMIT = 20  # requests per minute

