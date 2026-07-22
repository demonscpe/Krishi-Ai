"""Crop rotation recommendation router."""
from fastapi import APIRouter, HTTPException
import pandas as pd
from schemas.rotation import RotationRequest, RotationResponse
from services.ml_models import get_crop_rotation_model

router = APIRouter(tags=["Rotation"], prefix="/api/rotation")


@router.post("/recommend", response_model=RotationResponse)
async def rotation_recommend(data: RotationRequest):
    """Get crop rotation recommendation based on previous crop and soil data."""
    try:
        model = get_crop_rotation_model()

        previous_crop_mapping = {
            'Groundnut': 1, 'Millets': 2, 'Wheat': 3, 'Maize': 4,
            'Cotton': 5, 'Sorghum': 6, 'Barley': 7
        }
        soil_type_mapping = {
            'Loamy': 1, 'Clayey': 2, 'Sandy': 3, 'Saline': 4
        }
        crop_mapping = {
            1: 'Wheat', 2: 'Rice', 3: 'Millets', 4: 'Cotton',
            5: 'Groundnut', 6: 'Maize', 7: 'Sorghum', 8: 'Barley'
        }

        d = data.model_dump(by_alias=True)
        input_data = pd.DataFrame([{
            "Previous Crop": previous_crop_mapping.get(d.get("Previous Crop"), -1),
            "Soil Type": soil_type_mapping.get(d.get("Soil Type"), -1),
            "Moisture Level": d.get("Moisture Level"),
            "Nitrogen (N)": d.get("Nitrogen (N)"),
            "Phosphorus (P)": d.get("Phosphorus (P)"),
            "Potassium (K)": d.get("Potassium (K)")
        }])

        prediction = model.predict(input_data)
        crop = crop_mapping.get(prediction[0], "No prediction available")
        return RotationResponse(Recommended_Crop=crop)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

