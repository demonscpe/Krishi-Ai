"""Generate synthetic disease prevention dataset.
Maps (disease, plant, season) -> prevention measures.
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 300

DISEASE_PREVENTION_MAP = {
    "Early Blight": ["Crop rotation with non-solanaceous crops", "Use disease-free seeds", "Apply fungicides at first sign", "Remove infected leaves"],
    "Late Blight": ["Avoid overhead irrigation", "Plant resistant varieties", "Apply copper-based fungicides", "Destroy crop debris after harvest"],
    "Powdery Mildew": ["Ensure good air circulation", "Avoid high nitrogen fertilizer", "Apply sulfur fungicides", "Plant resistant varieties"],
    "Leaf Blast": ["Use resistant varieties", "Avoid excess nitrogen", "Seed treatment with fungicides", "Maintain proper plant spacing"],
    "Bacterial Blight": ["Use certified disease-free seeds", "Crop rotation with non-host crops", "Avoid field flooding", "Remove and destroy infected plants"],
    "Common Rust": ["Plant resistant hybrids", "Early planting to avoid peak rust season", "Apply fungicides when rust appears", "Crop rotation with non-cereals"],
    "Anthracnose": ["Prune infected branches", "Apply copper fungicides", "Improve air circulation", "Mulch around plants to prevent splash"],
    "Apple Scab": ["Rake and dispose of fallen leaves", "Apply fungicide in early spring", "Plant resistant cultivars", "Prune for better air circulation"],
    "Sigatoka": ["Remove infected older leaves", "Apply fungicide sprays", "Maintain proper drainage", "Use disease-free planting material"],
    "Leaf Curl": ["Control whitefly populations", "Use reflective mulch", "Apply neem oil sprays", "Remove infected plants immediately"],
    "Healthy": ["Maintain good agricultural practices", "Regular field monitoring", "Balanced fertilization", "Proper irrigation management"],
}

SEASONS = ['Kharif', 'Rabi', 'Zaid']
PREVENTION_TYPES = ['Cultural', 'Chemical', 'Biological', 'Integrated']

data = []
for _ in range(n_samples):
    disease = np.random.choice(list(DISEASE_PREVENTION_MAP.keys()))
    plant = np.random.choice(['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 'Mango', 'Banana'])
    season = np.random.choice(SEASONS)
    measures = DISEASE_PREVENTION_MAP[disease]
    
    for measure in measures:
        ptype = np.random.choice(PREVENTION_TYPES)
        data.append({
            'disease': disease,
            'plant': plant,
            'season': season,
            'prevention_measure': measure,
            'prevention_type': ptype,
            'effectiveness': round(np.random.uniform(0.3, 1.0), 2),
        })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "prevention_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} prevention records → {output_path}")
print(f"   Diseases: {df['disease'].nunique()} | Measures: {df['prevention_measure'].nunique()}")

