"""Soil Image Analysis router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from soil_image_analysis.schemas import SoilImageAnalysisResponse
from soil_image_analysis.service import analyze_image

router = APIRouter(tags=["Soil Image Analysis"], prefix="/api/soil-image-analysis")


@router.post("", response_model=SoilImageAnalysisResponse)
async def soil_image_analysis(image: UploadFile = File(...)):
    """Analyze a soil image to predict type, color, texture, and condition.
    
    Accepts image upload (PNG, JPG, JPEG) and returns analysis results.
    """
    try:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, JPEG).")

        contents = await image.read()
        
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB.")

        result = analyze_image(contents)
        return SoilImageAnalysisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

