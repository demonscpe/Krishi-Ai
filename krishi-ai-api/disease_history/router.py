"""Disease history router."""
from fastapi import APIRouter, HTTPException
from disease_history.schemas import DiseaseHistoryResponse
from disease_history.service import get_disease_history

router = APIRouter(prefix="/api/disease-history", tags=["Disease History"])


@router.get("", response_model=DiseaseHistoryResponse)
async def disease_history():
    """Get disease detection history with statistics."""
    try:
        result = await get_disease_history()
        return DiseaseHistoryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
