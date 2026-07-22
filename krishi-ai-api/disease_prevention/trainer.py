"""
Disease Prevention Model Trainer
==================================
Trains a classifier to recommend disease prevention measures.

Run from krishi-ai-api/ directory:
    python -m disease_prevention.trainer
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
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "prevention_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)


def generate_dataset():
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import disease_prevention.dataset.generate_dataset


def train():
    print("=" * 60)
    print("🛡️ Disease Prevention Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} prevention records")
    
    le_disease = LabelEncoder()
    le_plant = LabelEncoder()
    le_season = LabelEncoder()
    le_measure = LabelEncoder()
    
    df['disease_enc'] = le_disease.fit_transform(df['disease'])
    df['plant_enc'] = le_plant.fit_transform(df['plant'])
    df['season_enc'] = le_season.fit_transform(df['season'])
    y = le_measure.fit_transform(df['prevention_measure'])
    
    X = df[['disease_enc', 'plant_enc', 'season_enc', 'effectiveness']]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    print(f"\n   ✅ Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    
    model_path = MODEL_DIR / "disease_prevention_model.pkl"
    joblib.dump({'model': model}, model_path)
    for name, le in [('disease', le_disease), ('plant', le_plant), ('season', le_season), ('measure', le_measure)]:
        joblib.dump(le, MODEL_DIR / f"prevention_{name}_le.pkl")
    
    print(f"   💾 Saved: {model_path.name}")
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print('=' * 60)


if __name__ == '__main__':
    train()

