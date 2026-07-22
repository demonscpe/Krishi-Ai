"""Seed quality prediction service."""
import numpy as np
import os
from PIL import Image
from services.ml_models import get_seed_quality_model
from config import UPLOAD_DIR

SIZE = 120
CATEGORIES = ["broken", "discolored", "pure"]


async def predict_seed_quality(file_bytes: bytes, filename: str) -> dict:
    """Predict seed quality from an image."""
    temp_path = UPLOAD_DIR / filename
    with open(temp_path, "wb") as f:
        f.write(file_bytes)

    try:
        model = get_seed_quality_model()

        # Read image with PIL, convert to grayscale
        img = Image.open(temp_path).convert("L")
        img = img.resize((SIZE, SIZE))
        img_array = np.array(img) / 255.0
        input_arr = img_array.reshape(-1, SIZE, SIZE, 1)

        prediction = model.predict(input_arr, verbose=0)
        pclass = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        return {
            'class': CATEGORIES[pclass],
            'confidence': confidence
        }
    finally:
        # Clean up temp file
        if temp_path.exists():
            os.remove(temp_path)

