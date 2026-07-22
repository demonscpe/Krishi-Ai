"""Treatment recommendation service."""
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "treatments.json"

# Default treatment database
DEFAULT_TREATMENTS = {
    "Tomato": {
        "Early Blight": {
            "chemical": "Mancozeb (2g/L) or Chlorothalonil (2mL/L). Apply every 7-10 days.",
            "organic": "Neem oil (5mL/L) + baking soda (1g/L). Spray weekly.",
            "frequency": "Every 7-10 days, 3-4 applications",
            "remove": "Yes",
            "recovery": "10-14",
            "dosage": "Spray until runoff. 200L water per acre."
        },
        "Late Blight": {
            "chemical": "Metalaxyl + Mancozeb (2.5g/L) or Copper oxychloride (3g/L).",
            "organic": "Copper fungicide (2g/L). Bordeaux mixture 1%. Remove all infected debris.",
            "frequency": "Every 5-7 days, 4-5 applications",
            "remove": "Yes",
            "recovery": "14-21",
            "dosage": "Cover entire plant. 250L water per acre."
        },
        "Powdery Mildew": {
            "chemical": "Sulfur (2g/L) or Triadimefon (0.5g/L). Apply at first signs.",
            "organic": "Milk (1:10 dilution) + baking soda (1g/L). Neem oil weekly.",
            "frequency": "Every 7 days, 3 applications",
            "remove": "Yes",
            "recovery": "7-10",
            "dosage": "Focus on upper leaf surfaces. 150L per acre."
        },
        "Leaf Mold": {
            "chemical": "Chlorothalonil (2mL/L) or Difenoconazole (0.5mL/L).",
            "organic": "Copper soap (2g/L). Improve ventilation. Remove lower leaves.",
            "frequency": "Every 7-10 days",
            "remove": "Yes",
            "recovery": "10-14",
            "dosage": "Target lower leaf surfaces. 200L per acre."
        },
        "Mosaic Virus": {
            "chemical": "No chemical cure. Control aphids with Imidacloprid (0.5mL/L).",
            "organic": "Remove and destroy infected plants. Use reflective mulch to repel aphids.",
            "frequency": "As needed for aphid control",
            "remove": "Yes - destroy plants",
            "recovery": "No recovery - prevent spread",
            "dosage": "N/A"
        },
    },
    "Potato": {
        "Early Blight": {
            "chemical": "Mancozeb (2g/L) or Azoxystrobin (1mL/L). Start at first signs.",
            "organic": "Copper fungicide (3g/L). Remove infected leaves. Improve airflow.",
            "frequency": "Every 7-10 days",
            "remove": "Yes",
            "recovery": "10-14",
            "dosage": "200L water per acre. Cover both sides of leaves."
        },
        "Late Blight": {
            "chemical": "Metalaxyl + Mancozeb (2.5g/L). Cymoxanil + Mancozeb as alternative.",
            "organic": "Bordeaux mixture (1:1:100). Destroy volunteer potatoes. Hill soil up.",
            "frequency": "Every 5-7 days in wet conditions",
            "remove": "Yes - remove infected plants",
            "recovery": "14-21",
            "dosage": "250L per acre. Spray when humidity >90%."
        },
    },
}


async def get_treatment(plant: str, disease: str) -> dict:
    """Get treatment recommendation for a given plant and disease."""
    # Try to load from JSON dataset first
    treatments = DEFAULT_TREATMENTS
    if DATASET_PATH.exists():
        try:
            with open(DATASET_PATH) as f:
                treatments = json.load(f)
        except (json.JSONDecodeError, IOError):
            pass

    plant_data = treatments.get(plant, {})
    disease_data = plant_data.get(disease)

    if not disease_data:
        # Fallback generic treatment
        disease_data = {
            "chemical": f"Apply a broad-spectrum fungicide/bactericide suitable for {disease} on {plant}. Consult local agri extension for specific recommendations.",
            "organic": f"Use neem oil (5mL/L) spray. Remove and destroy affected plant parts. Improve overall plant health with balanced nutrition.",
            "frequency": "Every 7-10 days as needed",
            "remove": "Yes - remove affected parts",
            "recovery": "10-14 days with proper care",
            "dosage": "Follow label instructions. 200L water per acre."
        }

    return {
        "plant": plant,
        "disease": disease,
        "chemical_treatment": disease_data["chemical"],
        "organic_method": disease_data["organic"],
        "spray_frequency": disease_data["frequency"],
        "remove_infected_leaves": disease_data["remove"],
        "estimated_recovery_days": disease_data["recovery"],
        "dosage": disease_data.get("dosage"),
    }

