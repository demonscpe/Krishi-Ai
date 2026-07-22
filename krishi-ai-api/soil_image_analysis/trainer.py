"""
Soil Image Analysis Model Trainer
==================================
Trains a RandomForest classifier to predict soil type, color, texture, and condition
from extracted image color features.

Run from krishi-ai-api/ directory:
    python -m soil_image_analysis.trainer
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "soil_image_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['avg_r', 'avg_g', 'avg_b', 'std_r', 'std_g', 'std_b', 'brightness']
TARGETS = ['soil_type', 'color', 'texture', 'condition']


def generate_dataset():
    """Generate synthetic dataset if not exists."""
    if not DATASET_PATH.exists():
        print("📊 Generating synthetic dataset...")
        import soil_image_analysis.dataset.generate_dataset as gen
        gen


def train():
    print("=" * 60)
    print("🌱 Soil Image Analysis Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples")
    
    X = df[FEATURES].values
    results = {}
    
    for target in TARGETS:
        print(f"\n{'=' * 40}")
        print(f"🎯 Training: {target}")
        print('=' * 40)
        
        y_raw = df[target].values
        le = LabelEncoder()
        y = le.fit_transform(y_raw)
        
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
        print(f"   ✅ Accuracy: {acc:.4f} ({acc*100:.2f}%)")
        print(f"   📋 Classes: {list(le.classes_)}")
        
        # Save model + encoder
        model_path = MODEL_DIR / f"soil_image_{target}_model.pkl"
        le_path = MODEL_DIR / f"soil_image_{target}_le.pkl"
        joblib.dump(model, model_path)
        joblib.dump(le, le_path)
        print(f"   💾 Saved: {model_path.name}, {le_path.name}")
        
        results[target] = {
            'accuracy': float(acc),
            'classes': list(le.classes_),
            'samples': len(df),
            'n_features': len(FEATURES),
        }
    
    # Save combined model (multi-output)
    print(f"\n{'=' * 40}")
    print("🎯 Training combined multi-output model")
    print('=' * 40)
    
    y_combined = np.column_stack([
        LabelEncoder().fit_transform(df[t]) for t in TARGETS
    ])
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_combined, test_size=0.2, random_state=42
    )
    
    combined_model = RandomForestClassifier(
        n_estimators=300, max_depth=25,
        random_state=42, n_jobs=-1
    )
    combined_model.fit(X_train, y_train)
    y_pred_combined = combined_model.predict(X_test)
    
    # Per-target accuracy
    for i, target in enumerate(TARGETS):
        acc = accuracy_score(y_test[:, i], y_pred_combined[:, i])
        results[target]['combined_accuracy'] = float(acc)
        print(f"   {target:12s} → Accuracy: {acc:.4f}")
    
    model_path = MODEL_DIR / "soil_image_analysis_model.pkl"
    joblib.dump({
        'model': combined_model,
        'targets': TARGETS,
        'features': FEATURES,
    }, model_path)
    print(f"   💾 Saved: {model_path.name}")
    
    # Summary
    print(f"\n{'=' * 60}")
    print("📋 TRAINING SUMMARY")
    print('=' * 60)
    for target, res in results.items():
        print(f"   {target:12s} → Acc: {res['accuracy']:.4f} ({res['accuracy']*100:.2f}%)")
    print(f"\n   Features: {FEATURES}")
    print('=' * 60)
    print("✅ Training complete!")
    
    return results


if __name__ == '__main__':
    train()

