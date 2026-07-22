"""Disease prevention service."""
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

PREVENTION_DB = {
    "Early Blight": {
        "causes": ["High humidity and warm temperatures (20-30°C)", "Wet foliage from overhead irrigation or rain", "Infected seeds or transplants", "Soil-borne fungal spores", "Poor air circulation in dense plantings"],
        "prevention_steps": ["Use disease-free certified seeds", "Apply copper-based fungicide preventively", "Practice crop rotation (avoid Solanaceae family for 3-4 years)", "Water at the base of plants, avoid wetting leaves", "Remove and destroy infected plant debris", "Space plants properly for good air circulation"],
        "seasonal_precautions": ["Spring: Start preventative fungicide at flowering", "Monsoon: Increase fungicide frequency; ensure drainage", "Winter: Remove all crop debris after harvest"],
        "crop_rotation_advice": "Avoid planting tomatoes, potatoes, or peppers in the same area for at least 3 years. Rotate with legumes or cereals.",
        "irrigation_recommendations": "Use drip irrigation instead of overhead sprinklers. Water early in the day so foliage dries before nightfall."
    },
    "Late Blight": {
        "causes": ["Cool wet weather (10-20°C with >90% humidity)", "Phytophthora infestans spores carried by wind/rain", "Infected seed potatoes or transplants", "Overhead irrigation keeping foliage wet", "Volunteer plants from previous season"],
        "prevention_steps": ["Plant resistant varieties where available", "Apply preventative fungicide before disease appears", "Destroy volunteer potato/tomato plants", "Avoid dense planting - ensure airflow", "Monitor weather forecasts for blight-favorable conditions"],
        "seasonal_precautions": ["Monsoon: Apply fungicide every 7-10 days during wet weather", "Winter: Eliminate cull piles and volunteer plants"],
        "crop_rotation_advice": "Rotate with non-solanaceous crops for at least 4 years. Good options: maize, wheat, beans.",
        "irrigation_recommendations": "Avoid overhead irrigation entirely. Use drip irrigation or furrow irrigation. Irrigate in the morning only."
    },
    "Powdery Mildew": {
        "causes": ["High humidity with moderate temperatures (20-28°C)", "Poor air circulation in dense foliage", "Excessive nitrogen fertilizer promoting lush growth", "Overcrowding of plants", "Shaded growing conditions"],
        "prevention_steps": ["Space plants adequately for airflow", "Apply sulfur or neem oil preventively", "Avoid overhead watering late in the day", "Prune lower leaves to improve air circulation", "Use resistant varieties when available", "Maintain balanced fertilization - avoid excess nitrogen"],
        "seasonal_precautions": ["Dry season: Maintain regular preventive sprays", "Monsoon: Increase airflow by pruning; apply biofungicides"],
        "crop_rotation_advice": "Crop rotation is less critical for powdery mildew, but avoid continuous cropping of cucurbits and legumes.",
        "irrigation_recommendations": "Water at soil level using drip irrigation. If using overhead, water early morning so foliage dries quickly."
    },
    "Healthy": {
        "causes": ["No disease detected"],
        "prevention_steps": ["Continue regular monitoring", "Maintain balanced soil fertility", "Practice good field hygiene", "Follow integrated pest management practices"],
        "seasonal_precautions": ["Regular scouting every week", "Keep records of any observed issues"],
        "crop_rotation_advice": "Follow recommended crop rotation for your crop type.",
        "irrigation_recommendations": "Follow crop-specific irrigation recommendations."
    }
}

DEFAULT_PREVENTION = {
    "causes": ["Environmental stress factors", "Possible pathogen presence", "Suboptimal growing conditions"],
    "prevention_steps": ["Maintain good field hygiene", "Use quality seeds/transplants", "Ensure proper spacing and ventilation", "Apply balanced fertilizers", "Monitor regularly for early signs"],
    "seasonal_precautions": ["Adjust irrigation based on season", "Apply preventive treatments during high-risk periods"],
    "crop_rotation_advice": "Practice crop rotation with unrelated crop families.",
    "irrigation_recommendations": "Use drip irrigation to keep foliage dry. Water early morning."
}


async def get_prevention(plant: str, disease: str) -> dict:
    """Get prevention information for a given plant and disease."""
    info = PREVENTION_DB.get(disease, DEFAULT_PREVENTION)
    return info

