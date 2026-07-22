"""Health check router."""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Krishi-AI FastAPI is running"}

