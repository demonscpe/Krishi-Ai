"""
Disease Severity Model Trainer
================================
Trains a RandomForest regressor to predict disease severity percentage
from disease features and plant type.

Run from krishi-ai-api/ directory:
    python -m disease_severity.trainer
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "severity_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['avg_r', 'avg_g', 'avg_b', 'std_r', 'std_g', 'std_b', 'disease_enc', 'plant_enc']
TARGET = 'severity_percent'


def generate_dataset():
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import disease_severity.dataset.generate_dataset


def train():
    print("=" * 60)
    print("📊 Disease Severity Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples")
    
    le_disease = LabelEncoder()
    le_plant = LabelEncoder()
    
    df['disease_enc'] = le_disease.fit_transform(df['disease'])
    df['plant_enc'] = le_plant.fit_transform(df['plant'])
    
    X = df[FEATURES]
    y = df[TARGET]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=300, max_depth=20, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n   ✅ MAE: {mae:.2f}%")
    print(f"   ✅ R²: {r2:.4f} ({r2*100:.2f}%)")
    
    model_path = MODEL_DIR / "disease_severity_model.pkl"
    joblib.dump({'model': model, 'features': FEATURES}, model_path)
    joblib.dump(le_disease, MODEL_DIR / "severity_disease_le.pkl")
    joblib.dump(le_plant, MODEL_DIR / "severity_plant_le.pkl")
    print(f"\n   💾 Saved: {model_path.name}")
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print('=' * 60)
    
    return {'mae': float(mae), 'r2': float(r2)}


if __name__ == '__main__':
    train()

