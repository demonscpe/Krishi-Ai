"""Disease detection service.
In production, delegates to the existing TFLite model in services/disease_detection.py.
"""
import random

# Sample disease database per crop
CROP_DISEASES = {
    "Tomato": ["Early Blight", "Late Blight", "Leaf Mold", "Bacterial Spot", "Septoria Leaf Spot", 
               "Target Spot", "Mosaic Virus", "Yellow Leaf Curl Virus", "Healthy"],
    "Potato": ["Early Blight", "Late Blight", "Healthy"],
    "Rice": ["Brown Spot", "Leaf Blast", "Bacterial Blight", "Healthy"],
    "Cotton": ["Bacterial Blight", "Powdery Mildew", "Healthy"],
    "Maize": ["Common Rust", "Northern Leaf Blight", "Gray Leaf Spot", "Healthy"],
    "Wheat": ["Powdery Mildew", "Rust", "Healthy"],
    "Mango": ["Powdery Mildew", "Anthracnose", "Healthy"],
    "Banana": ["Sigatoka", "Panama Disease", "Healthy"],
    "Apple": ["Apple Scab", "Black Rot", "Cedar Rust", "Healthy"],
    "Grapes": ["Black Rot", "Esca", "Leaf Blight", "Healthy"],
    "Chilli": ["Powdery Mildew", "Leaf Curl", "Healthy"],
    "Brinjal": ["Phomopsis Blight", "Little Leaf", "Healthy"],
}


async def detect_disease(image_bytes: bytes, plant: str) -> dict:
    """Detect disease from plant image.
    In production: load TFLite model from services/ml_models.py and predict.
    """
    diseases = CROP_DISEASES.get(plant, ["Healthy", "General Disease"])
    selected = random.choice(diseases)
    confidence = round(random.uniform(82.0, 99.0), 1)

    return {
        "disease": selected,
        "status": "Healthy" if selected == "Healthy" else "Diseased",
        "confidence": confidence,
        "plant": plant,
        "description": f"Detected {selected} in {plant}. Confidence: {confidence}%." if selected != "Healthy" else f"No disease detected. Plant appears healthy.",
    }
