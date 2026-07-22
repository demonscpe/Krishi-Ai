"""Generate a synthetic soil image analysis dataset based on color features.
In production, replace this with real labeled soil images.

Each row represents extracted features from a soil image:
- avg_r, avg_g, avg_b: mean RGB values (0-255)
- std_r, std_g, std_b: standard deviation of RGB channels
- brightness: overall brightness
- soil_type: Black, Red, Sandy, Clay, Loamy, Alluvial
- color: Dark Brown, Reddish, Yellowish, Grey, Black, Brown
- texture: Sandy, Silty, Clayey, Loamy
- condition: Dry, Moist, Wet, Cracked, Eroded
"""
import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)
n_samples = 200

# Define realistic RGB ranges per soil type
SOIL_PROFILES = {
    "Black": {"avg_r": (20, 50), "avg_g": (15, 40), "avg_b": (10, 35), "std_range": (5, 20)},
    "Red": {"avg_r": (130, 220), "avg_g": (50, 90), "avg_b": (25, 55), "std_range": (15, 40)},
    "Sandy": {"avg_r": (170, 210), "avg_g": (150, 190), "avg_b": (100, 150), "std_range": (25, 55)},
    "Clay": {"avg_r": (90, 150), "avg_g": (60, 100), "avg_b": (35, 65), "std_range": (8, 25)},
    "Loamy": {"avg_r": (70, 130), "avg_g": (90, 140), "avg_b": (45, 90), "std_range": (12, 30)},
    "Alluvial": {"avg_r": (110, 170), "avg_g": (100, 160), "avg_b": (70, 120), "std_range": (15, 35)},
}

COLOR_MAP = {
    "Black": "Black",
    "Red": "Reddish",
    "Sandy": "Yellowish",
    "Clay": "Grey",
    "Loamy": "Dark Brown",
    "Alluvial": "Brown",
}

CONDITION_MAP = {
    "Dry": (180, 255),
    "Moist": (100, 180),
    "Wet": (30, 100),
    "Cracked": (150, 230),
    "Eroded": (100, 200),
}

data = []
for _ in range(n_samples):
    soil_type = np.random.choice(list(SOIL_PROFILES.keys()))
    profile = SOIL_PROFILES[soil_type]
    
    avg_r = np.random.uniform(*profile["avg_r"])
    avg_g = np.random.uniform(*profile["avg_g"])
    avg_b = np.random.uniform(*profile["avg_b"])
    std_range = profile["std_range"]
    std_r = np.random.uniform(*std_range)
    std_g = np.random.uniform(*std_range)
    std_b = np.random.uniform(*std_range)
    brightness = np.mean([avg_r, avg_g, avg_b])
    
    # Determine condition from brightness
    brightness_val = float(np.mean([avg_r, avg_g, avg_b]))
    condition = "Moist"
    for cond, (lo, hi) in CONDITION_MAP.items():
        if lo <= brightness_val <= hi:
            condition = cond
            break
    
    data.append({
        "avg_r": round(avg_r, 1),
        "avg_g": round(avg_g, 1),
        "avg_b": round(avg_b, 1),
        "std_r": round(std_r, 1),
        "std_g": round(std_g, 1),
        "std_b": round(std_b, 1),
        "brightness": round(brightness, 1),
        "soil_type": soil_type,
        "color": COLOR_MAP[soil_type],
        "texture": np.random.choice(["Sandy", "Silty", "Clayey", "Loamy"]),
        "condition": condition,
    })

df = pd.DataFrame(data)
output_path = Path(__file__).parent / "soil_image_dataset.csv"
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} samples → {output_path}")
print(f"   Soil types: {df['soil_type'].value_counts().to_dict()}")
print(f"   Conditions: {df['condition'].value_counts().to_dict()}")

