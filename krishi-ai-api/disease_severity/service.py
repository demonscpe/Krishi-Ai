"""Disease severity assessment service."""
import random


SEVERITY_PROFILES = {
    "Early Blight": {"base_affected": 25.0, "range": 15, "risk": "Medium", "rec": "Begin fungicide treatment immediately. Remove severely affected leaves."},
    "Late Blight": {"base_affected": 40.0, "range": 25, "risk": "High", "rec": "Apply copper-based fungicide. Destroy infected plants to prevent spread."},
    "Powdery Mildew": {"base_affected": 20.0, "range": 20, "risk": "Medium", "rec": "Apply sulfur or neem oil. Improve air circulation around plants."},
    "Leaf Mold": {"base_affected": 30.0, "range": 20, "risk": "Medium", "rec": "Reduce humidity. Apply fungicide. Remove lower infected leaves."},
    "Mosaic Virus": {"base_affected": 50.0, "range": 20, "risk": "High", "rec": "No cure. Remove infected plants to prevent spread. Control aphids."},
    "Bacterial Blight": {"base_affected": 35.0, "range": 20, "risk": "High", "rec": "Use copper-based bactericide. Avoid overhead irrigation."},
    "Brown Spot": {"base_affected": 20.0, "range": 15, "risk": "Low", "rec": "Apply fungicide. Improve drainage. Use resistant varieties."},
    "Leaf Blast": {"base_affected": 30.0, "range": 20, "risk": "Medium", "rec": "Apply systemic fungicide. Reduce nitrogen fertilizer."},
    "Curl Virus": {"base_affected": 45.0, "range": 25, "risk": "High", "rec": "Control whitefly population. Remove infected plants. Use reflective mulch."},
}


async def assess_severity(image_bytes: bytes, disease: str = None, plant: str = None) -> dict:
    """Assess disease severity from image.
    In production, replace with OpenCV analysis of affected area using color segmentation.
    """
    profile = SEVERITY_PROFILES.get(disease, {"base_affected": 30.0, "range": 20, "risk": "Medium",
                                               "rec": "Monitor plant health. Apply appropriate treatment if needed."})

    # Simulate affected area analysis
    affected = round(profile["base_affected"] + random.uniform(-profile["range"]/2, profile["range"]/2), 1)
    affected = max(0, min(100, affected))

    if affected < 20:
        severity = "Low"
        risk = "Low"
    elif affected < 45:
        severity = "Medium"
        risk = profile["risk"]
    else:
        severity = "High"
        risk = "High"

    return {
        "severity": severity,
        "affected_area_percent": affected,
        "risk_level": risk,
        "recommendation": profile["rec"],
        "annotated_image_base64": None,  # In production, return base64 of annotated image
    }

