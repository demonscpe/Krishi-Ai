"""
Plant Identification Model Trainer
===================================
Trains a RandomForest classifier to identify plants from image features.

Run from krishi-ai-api/ directory:
    python -m plant_identification.trainer
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
DATASET_PATH = BASE_DIR / "dataset" / "plant_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['avg_r', 'avg_g', 'avg_b', 'leaf_ratio']
CAT_FEATURES = ['texture', 'shape']
TARGET = 'plant'


def generate_dataset():
    """Generate synthetic dataset if not exists."""
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import plant_identification.dataset.generate_dataset


def train():
    print("=" * 60)
    print("🌱 Plant Identification Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples, {df[TARGET].nunique()} plant types")
    
    # Encode categorical features
    for col in CAT_FEATURES:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col])
        # Save encoders
        joblib.dump(le, MODEL_DIR / f"plant_id_{col}_le.pkl")
    
    feature_cols = FEATURES + [f'{c}_enc' for c in CAT_FEATURES]
    X = df[feature_cols]
    
    le_target = LabelEncoder()
    y = le_target.fit_transform(df[TARGET])
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(
        n_estimators=200, max_depth=20,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n   ✅ Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print(f"\n   📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_, zero_division=0))
    
    # Save model + encoder
    model_path = MODEL_DIR / "plant_identification_model.pkl"
    le_path = MODEL_DIR / "plant_identification_le.pkl"
    joblib.dump({
        'model': model,
        'features': feature_cols,
        'targets': list(le_target.classes_),
    }, model_path)
    joblib.dump(le_target, le_path)
    print(f"\n   💾 Saved: {model_path.name}, {le_path.name}")
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print('=' * 60)
    
    return {'accuracy': float(acc)}


if __name__ == '__main__':
    train()

