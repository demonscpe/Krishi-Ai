"""Plant disease detection router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from schemas.disease import DiseasePredictResponse
from services.disease_detection import predict_disease

router = APIRouter(tags=["Disease"], prefix="/api/disease")


@router.post("/predict", response_model=DiseasePredictResponse)
async def disease_predict(image: UploadFile = File(...)):
    """Predict plant disease from an uploaded image."""
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="No image file provided")

    try:
        img_bytes = await image.read()
        prediction = await predict_disease(img_bytes)

        if prediction is None:
            raise HTTPException(status_code=500, detail="Prediction failed")

        return DiseasePredictResponse(prediction=prediction)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

