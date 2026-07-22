"""Generate synthetic treatment recommendation dataset.
Maps (disease, severity) → treatment plan with chemical + organic options.

In production, replace with real agronomy treatment data.
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 300

TREATMENTS = {
    "Early Blight": {
        "chemical": ["Chlorothalonil", "Mancozeb", "Copper Oxychloride"],
        "organic": ["Neem Oil", "Baking Soda Spray", "Compost Tea"],
        "dosage_chemical": "2g/L water",
        "dosage_organic": "5ml/L water",
        "duration_days": (7, 14),
    },
    "Late Blight": {
        "chemical": ["Metalaxyl", "Mancozeb", "Fosetyl-Al"],
        "organic": ["Copper Soap", "Garlic Extract", "Bacillus subtilis"],
        "dosage_chemical": "2.5g/L water",
        "dosage_organic": "3ml/L water",
        "duration_days": (7, 10),
    },
    "Powdery Mildew": {
        "chemical": ["Sulfur", "Triadimefon", "Potassium Bicarbonate"],
        "organic": ["Milk Spray", "Neem Oil", "Baking Soda Solution"],
        "dosage_chemical": "3g/L water",
        "dosage_organic": "10ml/L water",
        "duration_days": (5, 10),
    },
    "Leaf Blast": {
        "chemical": ["Tricyclazole", "Carbendazim", "Edifenphos"],
        "organic": ["Pseudomonas fluorescens", "K-Based Silicate", "Neem Cake"],
        "dosage_chemical": "1.5g/L water",
        "dosage_organic": "5g/L water",
        "duration_days": (7, 15),
    },
    "Bacterial Blight": {
        "chemical": ["Streptomycin", "Copper Oxychloride", "Kasugamycin"],
        "organic": ["Bordeaux Mixture", "Garlic Bulb Extract", "Cow Urine"],
        "dosage_chemical": "1g/L water",
        "dosage_organic": "10ml/L water",
        "duration_days": (7, 10),
    },
    "Common Rust": {
        "chemical": ["Tebuconazole", "Propiconazole", "Flutriafol"],
        "organic": ["Neem Leaf Extract", "Sulfur Dust", "Trichoderma"],
        "dosage_chemical": "1ml/L water",
        "dosage_organic": "5g/L water",
        "duration_days": (5, 12),
    },
    "Anthracnose": {
        "chemical": ["Carbendazim", "Thiophanate-methyl", "Chlorothalonil"],
        "organic": ["Copper Fungicide", "Aloe Vera Gel", "Baking Soda"],
        "dosage_chemical": "2g/L water",
        "dosage_organic": "10ml/L water",
        "duration_days": (7, 14),
    },
    "Healthy": {
        "chemical": ["None Required"],
        "organic": ["Regular Watering", "Balanced Fertilizer"],
        "dosage_chemical": "N/A",
        "dosage_organic": "As per crop need",
        "duration_days": (0, 0),
    },
}

data = []
for disease, info in TREATMENTS.items():
    for _ in range(n_samples // len(TREATMENTS)):
        severity = np.random.uniform(0.1, 1.0) if disease != "Healthy" else 0
        chem = np.random.choice(info["chemical"])
        org = np.random.choice(info["organic"])
        duration = np.random.randint(info["duration_days"][0], info["duration_days"][1] + 1)
        
        data.append({
            'disease': disease,
            'severity': round(severity, 2),
            'chemical_treatment': chem,
            'organic_treatment': org,
            'chemical_dosage': info['dosage_chemical'],
            'organic_dosage': info['dosage_organic'],
            'duration_days': duration,
            'efficacy': round(np.random.uniform(70, 98), 1),
        })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "treatment_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} samples → {output_path}")
print(f"   Diseases: {df['disease'].value_counts().to_dict()}")

