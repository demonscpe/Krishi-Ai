"""Generate synthetic disease severity dataset.
Each row = (plant, disease, RGB features, severity_percent).
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 400

DISEASE_LIST = ['Early Blight', 'Late Blight', 'Powdery Mildew', 'Leaf Mold', 
                'Mosaic Virus', 'Bacterial Blight', 'Brown Spot', 'Leaf Blast',
                'Common Rust', 'Anthracnose', 'Apple Scab', 'Sigatoka',
                'Leaf Curl', 'Healthy']
PLANT_LIST = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 
              'Mango', 'Banana', 'Apple', 'Grapes', 'Chilli']

data = []
for _ in range(n_samples):
    plant = np.random.choice(PLANT_LIST)
    disease = np.random.choice(DISEASE_LIST)
    
    # Severity correlates with color shifts
    severity = np.random.uniform(0, 100)
    if disease == 'Healthy':
        severity = np.random.uniform(0, 5)
        r_shift, g_shift, b_shift = 0, 0, 0
    elif 'Blight' in disease:
        r_shift, g_shift, b_shift = 15, -15, -10
    elif 'Mildew' in disease:
        r_shift, g_shift, b_shift = 5, 5, 5
    elif 'Virus' in disease or 'Curl' in disease:
        r_shift, g_shift, b_shift = 10, -5, 5
    elif 'Rust' in disease:
        r_shift, g_shift, b_shift = 20, -5, -5
    else:
        r_shift, g_shift, b_shift = 5, -3, -2
    
    sev_scale = severity / 100.0
    avg_r = 120 + r_shift * sev_scale + np.random.normal(0, 5)
    avg_g = 100 + g_shift * sev_scale + np.random.normal(0, 5)
    avg_b = 60  + b_shift * sev_scale + np.random.normal(0, 5)
    
    data.append({
        'avg_r': round(avg_r, 1),
        'avg_g': round(avg_g, 1),
        'avg_b': round(avg_b, 1),
        'std_r': round(np.random.uniform(5, 30), 1),
        'std_g': round(np.random.uniform(5, 30), 1),
        'std_b': round(np.random.uniform(5, 30), 1),
        'disease': disease,
        'plant': plant,
        'severity_percent': round(severity, 1),
    })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "severity_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} severity records → {output_path}")

