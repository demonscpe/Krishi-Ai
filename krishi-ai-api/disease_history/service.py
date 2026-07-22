"""Disease history service."""
from datetime import datetime, timedelta
from typing import Optional
import random


async def get_disease_history(user_id: Optional[str] = None) -> dict:
    """Get disease detection history for a user.
    In production, query the database for real records.
    """
    # Sample demo data
    records = []
    diseases = ["Early Blight", "Late Blight", "Powdery Mildew", "Leaf Mold", "Bacterial Blight", "Healthy"]
    plants = ["Tomato", "Potato", "Rice", "Cotton", "Wheat", "Maize"]
    severities = ["Low", "Medium", "High"]
    statuses = ["Recovered", "Monitoring", "Treatment Ongoing"]

    for i in range(15):
        records.append({
            "date": (datetime.now() - timedelta(days=i * 3)).strftime("%Y-%m-%d"),
            "plant": random.choice(plants),
            "disease": random.choice(diseases),
            "severity": random.choice(severities),
            "treatment": "Applied recommended fungicide" if random.random() > 0.3 else "Organic neem treatment",
            "recovery_status": random.choice(statuses),
        })

    healthy_count = sum(1 for r in records if r["disease"] == "Healthy")
    disease_counts = {}
    plant_counts = {}
    for r in records:
        disease_counts[r["disease"]] = disease_counts.get(r["disease"], 0) + 1
        plant_counts[r["plant"]] = plant_counts.get(r["plant"], 0) + 1

    most_freq_disease = max(disease_counts, key=disease_counts.get) if disease_counts else "N/A"
    most_freq_crop = max(plant_counts, key=plant_counts.get) if plant_counts else "N/A"

    stats = {
        "total_records": len(records),
        "most_frequent_disease": most_freq_disease,
        "most_frequent_crop": most_freq_crop,
        "healthy_percentage": round((healthy_count / len(records)) * 100, 1) if records else 0,
    }

    return {"records": records, "stats": stats}
