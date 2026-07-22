"""
Crop model training & evaluation script.
Trains 3 separate models by crop category:
  - field_crops : rice, wheat, maize, cotton, etc.  → RandomForest
  - vegetables  : tomato, potato, onion, etc.        → SVC (tuned)
  - flowers     : rose, tulip, orchid, etc.          → SVC (tuned)

Run once from krishi-ai-api/ directory:
    python -m croprecommendation.trainer

Or use the accuracy endpoint to see current model performance:
    GET /api/croprecommendation/accuracy?category=field_crops
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import sys
from pathlib import Path

# Ensure project root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
CSV_PATH = BASE_DIR / "Crop_recommendation.csv"

DRIVE_FILE_ID = '105Zo7kOKitvVKej7fav__P4xGHEEKtlV'

CATEGORIES = {
    'field_crops': [
        'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans',
        'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango',
        'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya',
        'coconut', 'cotton', 'jute', 'coffee', 'wheat', 'sugarcane',
        'barley', 'tea', 'tobacco'
    ],
    'vegetables': [
        'tomato', 'potato', 'onion', 'garlic', 'carrot', 'cabbage',
        'broccoli', 'cauliflower', 'spinach', 'lettuce', 'cucumber',
        'pumpkin', 'radish', 'beetroot', 'okra', 'capsicum',
        'peas', 'beans', 'brinjal', 'chilli'
    ],
    'flowers': [
        'rose', 'lily', 'tulip', 'orchid', 'jasmine', 'marigold',
        'sunflower', 'lavender', 'petunia', 'gerbera', 'carnation',
        'poppy', 'dahlia', 'zinnia', 'chrysanthemum', 'gladiolus',
        'hollyhock', 'hibiscus', 'lotus', 'daisy'
    ],
}

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']


def add_features(X):
    X = X.copy()
    X['N_P_ratio'] = X['N'] / (X['P'] + 1)
    X['N_K_ratio'] = X['N'] / (X['K'] + 1)
    X['NPK_sum'] = X['N'] + X['P'] + X['K']
    X['temp_hum'] = X['temperature'] * X['humidity'] / 100
    return X


def download_dataset():
    """Download Crop_recommendation.csv from Google Drive if not present."""
    if CSV_PATH.exists():
        print(f'✅ Dataset already exists at {CSV_PATH}')
        return True

    print('📥 Downloading dataset from Google Drive...')
    try:
        import gdown
        gdown.download(f'https://drive.google.com/uc?id={DRIVE_FILE_ID}', str(CSV_PATH), quiet=False)
        return CSV_PATH.exists()
    except ImportError:
        print('❌ gdown not installed. Install with: pip install gdown')
        return False
    except Exception as e:
        print(f'❌ Download failed: {e}')
        return False


def train_all():
    """Train all category models and evaluate accuracy."""
    print('=' * 60)
    print('🌾 Crop Recommendation Model Trainer')
    print('=' * 60)

    # Ensure dataset exists
    if not download_dataset():
        print('❌ Cannot proceed without dataset.')
        return False

    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    df = df.dropna()
    print(f'\n📊 Dataset: {len(df)} rows, {df["label"].nunique()} unique crops')
    print(f'   Crops: {sorted(df["label"].unique())}')

    os.makedirs(MODEL_DIR, exist_ok=True)
    results = {}

    for category, crops in CATEGORIES.items():
        print(f'\n{"=" * 50}')
        print(f'🏷️  Category: {category.upper()} ({len(crops)} crops)')
        print('=' * 50)

        subset = df[df['label'].isin(crops)]
        if subset.empty:
            print(f'   ⚠️  No data found, skipping.')
            continue

        X = add_features(subset[FEATURES])
        le = LabelEncoder()
        y = le.fit_transform(subset['label'])

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f'   Samples: {len(subset)} | Train: {len(X_train)} | Test: {len(X_test)}')
        print(f'   Crop classes: {list(le.classes_)}')

        if category == 'field_crops':
            # RandomForest for field crops (larger dataset)
            model = Pipeline([
                ('scaler', StandardScaler()),
                ('clf', RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1))
            ])
            model.fit(X_train, y_train)
            print(f'   ✅ RandomForest trained')
        else:
            # GridSearch for vegetables/flowers (smaller datasets)
            pipe = Pipeline([
                ('scaler', StandardScaler()),
                ('clf', SVC(kernel='rbf', probability=True, random_state=42))
            ])
            param_grid = {
                'clf__C': [1, 10, 50, 100, 200],
                'clf__gamma': ['scale', 'auto', 0.01, 0.1],
            }
            grid = GridSearchCV(pipe, param_grid, cv=5, n_jobs=-1, scoring='accuracy', verbose=0)
            grid.fit(X_train, y_train)
            model = grid
            print(f'   ✅ SVC trained (best params: {grid.best_params_})')

        # Evaluate
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f'   🎯 Test Accuracy: {acc:.4f} ({acc * 100:.2f}%)')

        # Detailed report
        report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
        results[category] = {
            'accuracy': acc,
            'samples': len(subset),
            'report': report,
        }

        # Save model and label encoder
        model_path = MODEL_DIR / f'crop_model_{category}.pkl'
        le_path = MODEL_DIR / f'crop_le_{category}.pkl'
        joblib.dump(model, model_path)
        joblib.dump(le, le_path)
        print(f'   💾 Saved: {model_path.name}, {le_path.name}')

    # Summary
    print('\n' + '=' * 60)
    print('📋 TRAINING SUMMARY')
    print('=' * 60)
    overall_acc = 0
    total_samples = 0
    for cat, res in results.items():
        w = res['samples']
        print(f'   {cat:15s} → Accuracy: {res["accuracy"]:.4f} ({res["accuracy"] * 100:.2f}%) | Samples: {w}')
        overall_acc += res['accuracy'] * w
        total_samples += w

    if total_samples:
        print(f'\n   {"WEIGHTED AVERAGE":15s} → Accuracy: {overall_acc / total_samples:.4f} ({(overall_acc / total_samples) * 100:.2f}%)')
    print('=' * 60)
    print('✅ Training complete!')
    return True


if __name__ == '__main__':
    success = train_all()
    sys.exit(0 if success else 1)

