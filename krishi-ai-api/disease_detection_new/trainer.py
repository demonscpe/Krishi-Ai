"""
Disease Detection Model Trainer
=================================
Trains a RandomForest classifier to detect plant diseases from image features.

Run from krishi-ai-api/ directory:
    python -m disease_detection_new.trainer
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
DATASET_PATH = BASE_DIR / "dataset" / "disease_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['avg_r', 'avg_g', 'avg_b', 'severity']


def generate_dataset():
    """Generate synthetic dataset if not exists."""
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import disease_detection_new.dataset.generate_dataset


def train():
    print("=" * 60)
    print("🔬 Disease Detection Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples, {df['disease'].nunique()} diseases")
    
    # Encode plant type
    le_plant = LabelEncoder()
    df['plant_enc'] = le_plant.fit_transform(df['plant'])
    
    feature_cols = FEATURES + ['plant_enc']
    X = df[feature_cols]
    
    le_disease = LabelEncoder()
    y_disease = le_disease.fit_transform(df['disease'])
    y_healthy = df['is_healthy'].values
    
    # Train disease classifier
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_disease, test_size=0.2, random_state=42, stratify=y_disease
    )
    
    model = RandomForestClassifier(
        n_estimators=300, max_depth=25,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n   ✅ Disease Classifier Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    
    # Save models
    model_path = MODEL_DIR / "disease_detection_model.pkl"
    le_path = MODEL_DIR / "disease_detection_le.pkl"
    joblib.dump({
        'model': model,
        'features': feature_cols,
        'targets': list(le_disease.classes_),
    }, model_path)
    joblib.dump(le_disease, le_path)
    joblib.dump(le_plant, MODEL_DIR / "disease_detection_plant_le.pkl")
    
    print(f"\n   💾 Saved: {model_path.name}, {le_path.name}")
    
    # Train health classifier
    X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(
        X, y_healthy, test_size=0.2, random_state=42
    )
    health_model = RandomForestClassifier(n_estimators=100, random_state=42)
    health_model.fit(X_train_h, y_train_h)
    health_acc = health_model.score(X_test_h, y_test_h)
    print(f"   ✅ Health Classifier Accuracy: {health_acc:.4f} ({health_acc*100:.2f}%)")
    
    health_path = MODEL_DIR / "disease_health_classifier.pkl"
    joblib.dump(health_model, health_path)
    print(f"   💾 Saved: {health_path.name}")
    
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print('=' * 60)
    
    return {'accuracy': float(acc), 'health_accuracy': float(health_acc)}


if __name__ == '__main__':
    train()

