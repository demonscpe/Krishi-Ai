"""
Fertilizer Recommendation Model Trainer
==========================================
Trains an XGBoost classifier to recommend fertilizer type based on
soil NPK levels and crop type, plus a rule-based quantity calculator.

Run from krishi-ai-api/ directory:
    python -m fertilizer_recommendation.trainer
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
DATASET_PATH = BASE_DIR / "dataset" / "fertilizer_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['nitrogen', 'phosphorus', 'potassium', 'crop_type_enc', 'soil_type_enc', 
            'n_deficiency', 'p_deficiency', 'k_deficiency']
TARGET = 'recommended_fertilizer'


def generate_dataset():
    """Generate synthetic fertilizer recommendation dataset."""
    if DATASET_PATH.exists():
        return
    
    print("📊 Generating synthetic dataset...")
    np.random.seed(42)
    n = 500
    
    crop_types = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Barley', 'Millets', 'Pulses']
    soil_types = ['Loamy', 'Clayey', 'Sandy', 'Saline']
    
    # Fertilizer rules based on deficiency
    def get_fertilizer(n, p, k, crop):
        if n < 40 and p < 20:
            return 'DAP'
        elif n < 40:
            return 'Urea'
        elif p < 20:
            return 'SSP'
        elif k < 30:
            return 'MOP'
        elif n < 70:
            return 'NPK_Complex'
        else:
            choices = ['Urea', 'DAP', 'NPK_Complex', 'Organic_Compost']
            return np.random.choice(choices)
    
    data = []
    for _ in range(n):
        crop = np.random.choice(crop_types)
        soil = np.random.choice(soil_types)
        
        n = np.random.uniform(10, 200)
        p = np.random.uniform(5, 100)
        k = np.random.uniform(5, 150)
        
        # Encode deficiency severity
        n_def = 1 if n < 40 else (2 if n < 70 else 3)
        p_def = 1 if p < 20 else (2 if p < 40 else 3)
        k_def = 1 if k < 30 else (2 if k < 60 else 3)
        
        crop_enc = crop_types.index(crop)
        soil_enc = soil_types.index(soil)
        
        fert = get_fertilizer(n, p, k, crop)
        
        # Calculate quantity based on deficiency
        if 'Urea' in fert:
            qty = round(np.random.uniform(40, 80), 1)
        elif 'DAP' in fert:
            qty = round(np.random.uniform(30, 60), 1)
        elif 'MOP' in fert:
            qty = round(np.random.uniform(15, 30), 1)
        elif 'SSP' in fert:
            qty = round(np.random.uniform(60, 100), 1)
        elif 'Compost' in fert:
            qty = round(np.random.uniform(200, 500), 1)
        else:
            qty = round(np.random.uniform(30, 50), 1)
        
        data.append({
            'nitrogen': round(n, 1),
            'phosphorus': round(p, 1),
            'potassium': round(k, 1),
            'crop_type': crop,
            'soil_type': soil,
            'crop_type_enc': crop_enc,
            'soil_type_enc': soil_enc,
            'n_deficiency': n_def,
            'p_deficiency': p_def,
            'k_deficiency': k_def,
            'recommended_fertilizer': fert,
            'quantity_kg_per_acre': qty,
        })
    
    df = pd.DataFrame(data)
    df.to_csv(DATASET_PATH, index=False)
    print(f"✅ Generated {len(df)} samples → {DATASET_PATH}")
    print(f"   Fertilizers: {df['recommended_fertilizer'].value_counts().to_dict()}")


def train():
    print("=" * 60)
    print("🌿 Fertilizer Recommendation Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples")
    print(f"   Classes: {df[TARGET].nunique()} fertilizers")
    
    le = LabelEncoder()
    df['fert_encoded'] = le.fit_transform(df[TARGET])
    
    X = df[FEATURES]
    y = df['fert_encoded']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Try XGBoost first
    try:
        import xgboost as xgb
        model = xgb.XGBClassifier(
            n_estimators=300, max_depth=8, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1
        )
        model_type = "XGBoost"
    except ImportError:
        model = RandomForestClassifier(
            n_estimators=300, max_depth=15,
            random_state=42, n_jobs=-1
        )
        model_type = "RandomForest"
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"\n   ✅ Model: {model_type}")
    print(f"   🎯 Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    
    # Per-class metrics
    print(f"\n   📋 Per-class Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_, zero_division=0))
    
    # Save model + label encoder
    model_path = MODEL_DIR / "fertilizer_recommendation_model.pkl"
    le_path = MODEL_DIR / "fertilizer_recommendation_le.pkl"
    joblib.dump({
        'model': model,
        'features': FEATURES,
        'model_type': model_type,
        'metrics': {'accuracy': float(acc)},
    }, model_path)
    joblib.dump(le, le_path)
    print(f"\n   💾 Saved: {model_path.name}, {le_path.name}")
    
    # Create quantity rules model
    print(f"\n{'=' * 40}")
    print("📏 Training Quantity Predictor")
    print('=' * 40)
    
    try:
        from sklearn.ensemble import RandomForestRegressor
        qty_model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
        qty_model.fit(X_train, df.iloc[X_train.index]['quantity_kg_per_acre'])
        qty_pred = qty_model.predict(X_test)
        from sklearn.metrics import mean_absolute_error
        qty_mae = mean_absolute_error(df.iloc[X_test.index]['quantity_kg_per_acre'], qty_pred)
        print(f"   ✅ Quantity MAE: {qty_mae:.2f} kg/acre")
        
        qty_path = MODEL_DIR / "fertilizer_quantity_model.pkl"
        joblib.dump(qty_model, qty_path)
        print(f"   💾 Saved: {qty_path.name}")
    except Exception as e:
        print(f"   ⚠️ Quantity model skipped: {e}")
    
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print(f"   Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print('=' * 60)
    
    return {'accuracy': float(acc)}


if __name__ == '__main__':
    train()

