"""
Treatment Recommendation Model Trainer
========================================
Trains a RandomForest classifier to recommend treatments based on
disease, plant type, and severity level.

Run from krishi-ai-api/ directory:
    python -m treatment_recommendation.trainer
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "treatment_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['disease_enc', 'plant_enc', 'severity_level']
TARGET = 'treatment_type'


def generate_dataset():
    """Generate synthetic dataset if not exists."""
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import treatment_recommendation.dataset.generate_dataset


def train():
    print("=" * 60)
    print("💊 Treatment Recommendation Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples, {df[TARGET].nunique()} treatment types")
    
    le_disease = LabelEncoder()
    le_plant = LabelEncoder()
    le_treatment = LabelEncoder()
    
    df['disease_enc'] = le_disease.fit_transform(df['disease'])
    df['plant_enc'] = le_plant.fit_transform(df['plant'])
    y = le_treatment.fit_transform(df[TARGET])
    
    X = df[FEATURES]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(
        n_estimators=200, max_depth=15,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n   ✅ Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    
    model_path = MODEL_DIR / "treatment_recommendation_model.pkl"
    joblib.dump({
        'model': model,
        'features': FEATURES,
        'targets': list(le_treatment.classes_),
    }, model_path)
    joblib.dump(le_disease, MODEL_DIR / "treatment_disease_le.pkl")
    joblib.dump(le_plant, MODEL_DIR / "treatment_plant_le.pkl")
    joblib.dump(le_treatment, MODEL_DIR / "treatment_type_le.pkl")
    print(f"\n   💾 Saved: {model_path.name}")
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print('=' * 60)
    
    return {'accuracy': float(acc)}


if __name__ == '__main__':
    train()

