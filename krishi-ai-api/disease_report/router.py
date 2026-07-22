"""Disease report router."""
from fastapi import APIRouter, HTTPException, Query
from disease_report.schemas import DiseaseReportResponse
from disease_report.service import generate_disease_report_pdf

router = APIRouter(prefix="/api/disease-report", tags=["Disease Report"])


@router.get("/pdf", response_model=DiseaseReportResponse)
async def disease_report_pdf(
    plant: str = Query(None, description="Plant/crop type"),
    disease: str = Query(None, description="Disease name"),
    severity: str = Query(None, description="Severity level"),
    treatment: str = Query(None, description="Treatment text"),
    confidence: float = Query(None, description="Detection confidence"),
):
    """Generate and download a disease analysis PDF report."""
    try:
        result = await generate_disease_report_pdf(plant, disease, severity, treatment, confidence)
        return DiseaseReportResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
