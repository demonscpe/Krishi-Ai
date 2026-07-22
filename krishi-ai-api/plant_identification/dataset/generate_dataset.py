"""Generate synthetic plant identification dataset.
In production, replace with real labeled plant images.

Each row represents extracted features from a plant image:
- avg_r, avg_g, avg_b: mean RGB values (0-255)
- leaf_ratio: estimated leaf area ratio (0-1)
- texture: smooth, rough, glossy
- shape: oval, round, elongated, heart
- plant: Tomato, Potato, Rice, Cotton, Maize, etc.
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 300

PLANTS = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Maize', 'Wheat', 
          'Mango', 'Banana', 'Apple', 'Grapes', 'Chilli', 'Brinjal']

PLANT_PROFILES = {
    'Tomato':  {'r': (100, 160), 'g': (40, 80),  'b': (20, 50),  'leaf': (0.6, 0.9), 'texture': 0, 'shape': 2},
    'Potato':  {'r': (80, 140),  'g': (60, 100), 'b': (30, 60),  'leaf': (0.5, 0.8), 'texture': 1, 'shape': 1},
    'Rice':    {'r': (130, 200), 'g': (120, 180),'b': (50, 90),  'leaf': (0.3, 0.6), 'texture': 2, 'shape': 3},
    'Cotton':  {'r': (90, 150),  'g': (80, 140), 'b': (40, 70),  'leaf': (0.4, 0.7), 'texture': 0, 'shape': 1},
    'Maize':   {'r': (110, 170), 'g': (100, 160),'b': (45, 80),  'leaf': (0.3, 0.6), 'texture': 1, 'shape': 3},
    'Wheat':   {'r': (140, 200), 'g': (130, 190),'b': (55, 95),  'leaf': (0.2, 0.5), 'texture': 2, 'shape': 3},
    'Mango':   {'r': (60, 120),  'g': (90, 150), 'b': (35, 65),  'leaf': (0.5, 0.8), 'texture': 0, 'shape': 2},
    'Banana':  {'r': (70, 130),  'g': (100, 170),'b': (40, 70),  'leaf': (0.4, 0.7), 'texture': 0, 'shape': 3},
    'Apple':   {'r': (50, 100),  'g': (70, 130), 'b': (30, 55),  'leaf': (0.5, 0.8), 'texture': 0, 'shape': 1},
    'Grapes':  {'r': (80, 140),  'g': (60, 110), 'b': (35, 60),  'leaf': (0.4, 0.7), 'texture': 1, 'shape': 0},
    'Chilli':  {'r': (90, 150),  'g': (50, 90),  'b': (25, 50),  'leaf': (0.5, 0.8), 'texture': 0, 'shape': 3},
    'Brinjal': {'r': (70, 130),  'g': (40, 80),  'b': (30, 55),  'leaf': (0.5, 0.8), 'texture': 0, 'shape': 2},
}

TEXTURE_MAP = ['smooth', 'rough', 'glossy']
SHAPE_MAP = ['oval', 'round', 'elongated', 'heart']

data = []
for _ in range(n_samples):
    plant = np.random.choice(PLANTS)
    profile = PLANT_PROFILES[plant]
    
    avg_r = np.random.uniform(*profile['r'])
    avg_g = np.random.uniform(*profile['g'])
    avg_b = np.random.uniform(*profile['b'])
    leaf_ratio = np.random.uniform(*profile['leaf'])
    
    data.append({
        'avg_r': round(avg_r, 1),
        'avg_g': round(avg_g, 1),
        'avg_b': round(avg_b, 1),
        'leaf_ratio': round(leaf_ratio, 3),
        'texture': TEXTURE_MAP[np.random.choice([0, 1, 2])],
        'shape': SHAPE_MAP[np.random.choice([0, 1, 2, 3])],
        'plant': plant,
    })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "plant_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} samples → {output_path}")
print(f"   Plants: {df['plant'].value_counts().to_dict()}")

