"""Generate synthetic disease detection dataset.
Each row = plant × disease pair with image features that correlate to disease patterns.

In production, replace with real labeled disease images (e.g. PlantVillage dataset).
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 500

DISEASE_DB = {
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

# Disease severity indicators (RGB shift patterns)
DISEASE_SIGNATURES = {
    "Early Blight": {'r_shift': (10, 30), 'g_shift': (-20, -5), 'b_shift': (-15, -5)},
    "Late Blight": {'r_shift': (15, 35), 'g_shift': (-30, -10), 'b_shift': (-25, -10)},
    "Leaf Mold": {'r_shift': (5, 15), 'g_shift': (-10, 0), 'b_shift': (-5, 5)},
    "Bacterial Spot": {'r_shift': (0, 10), 'g_shift': (-15, -5), 'b_shift': (-10, 0)},
    "Brown Spot": {'r_shift': (5, 20), 'g_shift': (-10, 5), 'b_shift': (-5, 10)},
    "Leaf Blast": {'r_shift': (0, 15), 'g_shift': (-5, 10), 'b_shift': (5, 15)},
    "Powdery Mildew": {'r_shift': (5, 10), 'g_shift': (5, 10), 'b_shift': (5, 10)},
    "Healthy": {'r_shift': (0, 5), 'g_shift': (0, 5), 'b_shift': (0, 5)},
    "Common Rust": {'r_shift': (10, 25), 'g_shift': (-10, 0), 'b_shift': (-5, 5)},
    "Anthracnose": {'r_shift': (8, 20), 'g_shift': (-15, -5), 'b_shift': (-10, -2)},
    "Apple Scab": {'r_shift': (5, 15), 'g_shift': (-5, 5), 'b_shift': (0, 10)},
    "Black Rot": {'r_shift': (3, 12), 'g_shift': (-10, -2), 'b_shift': (-5, 2)},
    "Sigatoka": {'r_shift': (2, 10), 'g_shift': (-8, 0), 'b_shift': (-3, 5)},
}

BASE_R, BASE_G, BASE_B = 120, 100, 60

data = []
for _ in range(n_samples):
    plant = np.random.choice(list(DISEASE_DB.keys()))
    disease = np.random.choice(DISEASE_DB[plant])
    
    signature = DISEASE_SIGNATURES.get(disease, {'r_shift': (0, 5), 'g_shift': (0, 5), 'b_shift': (0, 5)})
    
    avg_r = BASE_R + np.random.uniform(*signature['r_shift'])
    avg_g = BASE_G + np.random.uniform(*signature['g_shift'])
    avg_b = BASE_B + np.random.uniform(*signature['b_shift'])
    severity = np.random.uniform(0.1, 1.0) if disease != "Healthy" else 0
    
    data.append({
        'avg_r': round(avg_r, 1),
        'avg_g': round(avg_g, 1),
        'avg_b': round(avg_b, 1),
        'plant': plant,
        'disease': disease,
        'severity': round(severity, 3),
        'is_healthy': 1 if disease == "Healthy" else 0,
    })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "disease_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} samples → {output_path}")
print(f"   Diseases: {df['disease'].value_counts().to_dict()}")

