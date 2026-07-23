"""
Trains 3 separate models by crop category:
  - field_crops : rice, wheat, maize, cotton, etc.  → RandomForest
  - vegetables  : tomato, potato, onion, etc.        → SVC (tuned)
  - flowers     : rose, tulip, orchid, etc.          → SVC (tuned)

Run once:
    python train_crop_model.py
"""
import warnings
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
import joblib, os, gdown

warnings.filterwarnings(
    'ignore',
    message='.*probability.*deprecated in 1\.9.*',
    category=FutureWarning,
)

DRIVE_FILE_ID = '105Zo7kOKitvVKej7fav__P4xGHEEKtlV'
CSV_PATH      = 'Crop_recommendation.csv'

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

def add_features(X):
    X = X.copy()
    X['N_P_ratio'] = X['N'] / (X['P'] + 1)
    X['N_K_ratio'] = X['N'] / (X['K'] + 1)
    X['NPK_sum']   = X['N'] + X['P'] + X['K']
    X['temp_hum']  = X['temperature'] * X['humidity'] / 100
    return X

if not os.path.exists(CSV_PATH):
    print('Downloading dataset from Google Drive...')
    gdown.download(f'https://drive.google.com/uc?id={DRIVE_FILE_ID}', CSV_PATH, quiet=False)

df = pd.read_csv(CSV_PATH)
df.columns = df.columns.str.strip()
df = df.dropna()
print(f'Total rows: {len(df)}, Unique crops: {df["label"].nunique()}')

os.makedirs('./models', exist_ok=True)
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

for category, crops in CATEGORIES.items():
    subset = df[df['label'].isin(crops)]
    if subset.empty:
        print(f'[{category}] No data found, skipping.')
        continue

    X = add_features(subset[FEATURES])
    le = LabelEncoder()
    y  = le.fit_transform(subset['label'])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    if category == 'field_crops':
        model = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1))
        ])
        model.fit(X_train, y_train)
    else:
        # GridSearch finds best C and gamma for SVC on small datasets.
        # Use CalibratedClassifierCV instead of probability=True to avoid sklearn deprecation.
        svc = SVC(kernel='rbf', random_state=42)
        calibrated_svc = CalibratedClassifierCV(svc, cv=3, ensemble=False)
        pipe = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', calibrated_svc)
        ])
        param_grid = {
            'clf__estimator__C':     [1, 10, 50, 100],
            'clf__estimator__gamma': ['scale', 0.1],
        }
        model = GridSearchCV(pipe, param_grid, cv=3, n_jobs=-1, scoring='accuracy', verbose=2)
        model.fit(X_train, y_train)
        print(f'  Best params: {model.best_params_}')

    acc = model.score(X_test, y_test)
    print(f'[{category}] rows={len(subset)}, crops={len(le.classes_)}, accuracy={acc:.4f}')

    joblib.dump(model, f'./models/crop_model_{category}.pkl')
    joblib.dump(le,    f'./models/crop_le_{category}.pkl')
    print(f'  Saved: models/crop_model_{category}.pkl')
    print(f'  Crops: {list(le.classes_)}')
