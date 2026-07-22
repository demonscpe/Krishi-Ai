"""Application configuration & model paths."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directory (krishi-ai-api/)
BASE_DIR = Path(__file__).resolve().parent

# Model directories
MODEL_DIR = BASE_DIR / "models"
CROP_DATA_DIR = BASE_DIR / "crops"
UPLOAD_DIR = BASE_DIR / "uploads"

# Ensure upload dir exists
UPLOAD_DIR.mkdir(exist_ok=True)

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

# Rate limiting
CHAT_RATE_LIMIT = 20  # requests per minute

