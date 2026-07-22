"""
Soil Health Analyzer Model Trainer
====================================
Trains an XGBoost regressor to predict soil health score (0-100)
from soil test values (NPK, pH, EC, OC).

Run from krishi-ai-api/ directory:
    python -m soil_health_analyzer.trainer
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset" / "soil_health_dataset.csv"
MODEL_DIR = BASE_DIR.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ['nitrogen', 'phosphorus', 'potassium', 'ph', 'organic_carbon', 'ec']
TARGET = 'health_score'


def generate_dataset():
    """Generate synthetic dataset with realistic soil health relationships."""
    if DATASET_PATH.exists():
        return
    
    print("📊 Generating synthetic dataset...")
    np.random.seed(42)
    n = 300
    
    data = {
        'nitrogen': np.random.uniform(10, 200, n),
        'phosphorus': np.random.uniform(5, 100, n),
        'potassium': np.random.uniform(5, 150, n),
        'ph': np.random.uniform(4.5, 9.0, n),
        'organic_carbon': np.random.uniform(0.2, 3.0, n),
        'ec': np.random.uniform(0.1, 4.0, n),
    }
    df = pd.DataFrame(data)
    
    # Generate health score based on rules
    df['n_score'] = np.clip(df['nitrogen'] / 100 * 25, 0, 25)
    df['p_score'] = np.clip(df['phosphorus'] / 50 * 20, 0, 20)
    df['k_score'] = np.clip(df['potassium'] / 75 * 20, 0, 20)
    df['ph_score'] = np.clip(20 - abs(df['ph'] - 6.8) / 3.5 * 20, 0, 20)
    df['oc_score'] = np.clip(df['organic_carbon'] / 2.0 * 10, 0, 10)
    df['ec_score'] = np.clip(5 - df['ec'] * 1.25, 0, 5)
    
    df['health_score'] = (df['n_score'] + df['p_score'] + df['k_score'] + 
                          df['ph_score'] + df['oc_score'] + df['ec_score'])
    df['health_score'] = df['health_score'].clip(0, 100)
    
    # Add noise for realism
    df['health_score'] += np.random.normal(0, 3, n)
    df['health_score'] = df['health_score'].clip(0, 100).round(1)
    
    df = df[FEATURES + [TARGET]]
    df.to_csv(DATASET_PATH, index=False)
    print(f"✅ Generated {len(df)} samples → {DATASET_PATH}")


def train():
    print("=" * 60)
    print("🏥 Soil Health Analyzer Model Trainer")
    print("=" * 60)
    
    generate_dataset()
    
    df = pd.read_csv(DATASET_PATH)
    print(f"\n📊 Dataset: {len(df)} samples")
    print(f"   Score range: {df[TARGET].min():.1f} - {df[TARGET].max():.1f}")
    print(f"   Score mean: {df[TARGET].mean():.1f}")
    
    X = df[FEATURES]
    y = df[TARGET]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Try XGBoost first, fall back to RandomForest
    try:
        import xgboost as xgb
        model = xgb.XGBRegressor(
            n_estimators=300, max_depth=8, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8,
            random_state=42, n_jobs=-1
        )
        model_type = "XGBoost"
    except ImportError:
        model = RandomForestRegressor(
            n_estimators=300, max_depth=15,
            random_state=42, n_jobs=-1
        )
        model_type = "RandomForest"
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n   ✅ Model: {model_type}")
    print(f"   📊 MAE: {mae:.2f}")
    print(f"   📊 R² Score: {r2:.4f} ({r2*100:.2f}%)")
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        print(f"\n   📋 Feature Importances:")
        for feat, imp in sorted(zip(FEATURES, model.feature_importances_), 
                                key=lambda x: x[1], reverse=True):
            print(f"      {feat:15s}: {imp:.3f}")
    
    # Save model
    model_path = MODEL_DIR / "soil_health_model.pkl"
    joblib.dump({
        'model': model,
        'features': FEATURES,
        'model_type': model_type,
        'metrics': {'mae': float(mae), 'r2': float(r2)},
    }, model_path)
    print(f"\n   💾 Saved: {model_path.name}")
    
    # Also save as plain model for compatibility
    joblib.dump(model, MODEL_DIR / "soil_health_regressor.pkl")
    
    print(f"\n{'=' * 60}")
    print("✅ Training complete!")
    print(f"   MAE: {mae:.2f} | R²: {r2:.4f}")
    print('=' * 60)
    
    return {'mae': float(mae), 'r2': float(r2)}


if __name__ == '__main__':
    train()

