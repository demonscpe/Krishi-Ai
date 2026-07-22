"""Soil Test Input router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from soil_test_input.schemas import SoilTestRequest, SoilTestResponse, OcrResponse
from soil_test_input.service import save_soil_test
from soil_test_input.ocr import extract_soil_values

router = APIRouter(tags=["Soil Test Input"], prefix="/api/soil-test")


@router.post("/ocr", response_model=OcrResponse)
async def ocr_soil_report(pdf: UploadFile = File(...)):
    """Extract soil test values from an uploaded lab report PDF using OCR."""
    try:
        if not pdf.content_type or pdf.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File must be a PDF.")

        contents = await pdf.read()
        
        if len(contents) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="PDF size must be less than 20MB.")

        result = extract_soil_values(contents)
        parsed_count = result.pop("parsed_fields", 0)
        
        return OcrResponse(
            **result,
            parsed_fields=parsed_count,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@router.post("", response_model=SoilTestResponse)
async def save_soil_test_data(data: SoilTestRequest):
    """Save soil test values (manual entry or OCR-corrected)."""
    try:
        result = save_soil_test(data.model_dump())
        return SoilTestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

