# Krishi-AI Crop Recommendation - Terminal Test Script
# Run from krishi-ai-api/ directory:
#   .venv\Scripts\python.exe test_crop.py           # train + test + accuracy
#   .venv\Scripts\python.exe test_crop.py --train   # force retrain
#   .venv\Scripts\python.exe test_crop.py --test    # sample tests only
#   .venv\Scripts\python.exe test_crop.py --accuracy
#   .venv\Scripts\python.exe test_crop.py --interactive

import sys
import os
import argparse
import numpy as np
import joblib
import pandas as pd
from pathlib import Path

BASE_DIR  = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
CSV_PATH  = BASE_DIR / "Crop_recommendation.csv"

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

SAMPLE_TESTS = [
    {
        "label"      : "Ideal Rice conditions",
        "category"   : "field_crops",
        "Nitrogen"   : 90,
        "Phosphorus" : 42,
        "Potassium"  : 43,
        "Temperature": 24.0,
        "Humidity"   : 82.0,
        "ph"         : 6.5,
        "Rainfall"   : 202.0,
        "expected"   : "rice",
    },
    {
        "label"      : "Ideal Wheat conditions",
        "category"   : "field_crops",
        "Nitrogen"   : 60,
        "Phosphorus" : 55,
        "Potassium"  : 38,
        "Temperature": 18.0,
        "Humidity"   : 65.0,
        "ph"         : 6.8,
        "Rainfall"   : 75.0,
        "expected"   : "wheat",
    },
    {
        "label"      : "Ideal Maize conditions",
        "category"   : "field_crops",
        "Nitrogen"   : 77,
        "Phosphorus" : 48,
        "Potassium"  : 22,
        "Temperature": 22.0,
        "Humidity"   : 65.0,
        "ph"         : 6.2,
        "Rainfall"   : 85.0,
        "expected"   : "maize",
    },
    {
        "label"      : "Ideal Cotton conditions",
        "category"   : "field_crops",
        "Nitrogen"   : 118,
        "Phosphorus" : 32,
        "Potassium"  : 34,
        "Temperature": 25.0,
        "Humidity"   : 79.0,
        "ph"         : 6.5,
        "Rainfall"   : 80.0,
        "expected"   : "cotton",
    },
    {
        "label"      : "Ideal Chickpea conditions",
        "category"   : "field_crops",
        "Nitrogen"   : 40,
        "Phosphorus" : 67,
        "Potassium"  : 19,
        "Temperature": 18.0,
        "Humidity"   : 16.0,
        "ph"         : 7.2,
        "Rainfall"   : 80.0,
        "expected"   : "chickpea",
    },
]


def add_features(N, P, K, T, H, ph, R):
    """Build DataFrame with exact column names the trained model expects."""
    return pd.DataFrame([{
        'N'         : N,
        'P'         : P,
        'K'         : K,
        'temperature': T,
        'humidity'  : H,
        'ph'        : ph,
        'rainfall'  : R,
        'N_P_ratio' : N / (P + 1),
        'N_K_ratio' : N / (K + 1),
        'NPK_sum'   : N + P + K,
        'temp_hum'  : T * H / 100,
    }])


def load_model(category):
    model_path = MODEL_DIR / f"crop_model_{category}.pkl"
    le_path    = MODEL_DIR / f"crop_le_{category}.pkl"
    if not model_path.exists():
        return None, None
    return joblib.load(model_path), joblib.load(le_path)


def predict(category, N, P, K, T, H, ph, R):
    model, le = load_model(category)
    if model is None:
        return None, None, []

    features    = add_features(N, P, K, T, H, ph, R)
    proba       = model.predict_proba(features)[0]
    top_indices = np.argsort(proba)[::-1][:4]
    classes     = le.classes_

    prediction   = classes[top_indices[0]]
    confidence   = round(float(proba[top_indices[0]]) * 100, 2)
    alternatives = [
        "%s (%.2f%%)" % (classes[i], float(proba[i]) * 100)
        for i in top_indices[1:]
    ]
    return prediction, confidence, alternatives


def run_training():
    print("\n" + "=" * 60)
    print("  TRAINING MODELS")
    print("=" * 60)
    from croprecommendation.trainer import train_all
    train_all()


def run_sample_tests():
    print("\n" + "=" * 60)
    print("  SAMPLE PREDICTION TESTS")
    print("=" * 60)

    passed = 0
    for i, t in enumerate(SAMPLE_TESTS, 1):
        pred, conf, alts = predict(
            t["category"],
            t["Nitrogen"], t["Phosphorus"], t["Potassium"],
            t["Temperature"], t["Humidity"], t["ph"], t["Rainfall"],
        )

        print("\n[%d] %s" % (i, t["label"]))
        print("     Input      : N=%s P=%s K=%s T=%sC H=%s%% pH=%s R=%smm" % (
            t["Nitrogen"], t["Phosphorus"], t["Potassium"],
            t["Temperature"], t["Humidity"], t["ph"], t["Rainfall"]
        ))

        if pred is None:
            print("     [!] Model not found for category: %s" % t["category"])
            continue

        ok = pred.lower() == t["expected"].lower()
        if ok:
            passed += 1

        print("     Expected    : %s" % t["expected"])
        print("     Predicted   : %s  (%.2f%%)" % (pred, conf))
        print("     Alternatives: %s" % ", ".join(alts))
        print("     Result      : %s" % ("[PASS]" if ok else "[FAIL]"))

    print("\n  Score: %d/%d tests passed" % (passed, len(SAMPLE_TESTS)))
    print("=" * 60)


def run_accuracy():
    print("\n" + "=" * 60)
    print("  MODEL ACCURACY ON FULL DATASET")
    print("=" * 60)

    if not CSV_PATH.exists():
        print("  [!] Dataset not found at %s" % CSV_PATH)
        return

    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    df = df.dropna()

    from sklearn.metrics import accuracy_score, classification_report
    from croprecommendation.service import CATEGORY_CROPS

    total_correct = 0
    total_samples = 0

    for category, crops in CATEGORY_CROPS.items():
        model, le = load_model(category)
        if model is None:
            print("\n  [%s] Model not found - run --train first" % category)
            continue

        subset = df[df['label'].isin(crops)]
        if subset.empty:
            print("\n  [%s] No matching rows in dataset" % category)
            continue

        X = subset[FEATURES].copy()
        X['N_P_ratio'] = X['N'] / (X['P'] + 1)
        X['N_K_ratio'] = X['N'] / (X['K'] + 1)
        X['NPK_sum']   = X['N'] + X['P'] + X['K']
        X['temp_hum']  = X['temperature'] * X['humidity'] / 100

        y_true = le.transform(subset['label'])
        y_pred = model.predict(X)

        acc = accuracy_score(y_true, y_pred)
        total_correct += int((y_true == y_pred).sum())
        total_samples += len(subset)

        print("\n  [%s]" % category.upper())
        print("    Samples  : %d" % len(subset))
        print("    Accuracy : %.4f  (%.2f%%)" % (acc, acc * 100))
        print("    Crops    : %s" % list(le.classes_))

        report = classification_report(
            y_true, y_pred,
            target_names=le.classes_,
            output_dict=True,
            zero_division=0,
        )
        print("    %-20s %10s %8s %8s %9s" % ("Crop", "Precision", "Recall", "F1", "Support"))
        print("    " + "-" * 57)
        for crop in le.classes_:
            m = report.get(crop, {})
            print("    %-20s %10.2f %8.2f %8.2f %9d" % (
                crop,
                m.get('precision', 0),
                m.get('recall', 0),
                m.get('f1-score', 0),
                int(m.get('support', 0)),
            ))

    if total_samples:
        overall = total_correct / total_samples
        print("\n  " + "=" * 57)
        print("  OVERALL ACCURACY : %.4f  (%.2f%%)" % (overall, overall * 100))
        print("  Total Samples    : %d" % total_samples)
    print("=" * 60)


def run_interactive():
    print("\n" + "=" * 60)
    print("  CUSTOM INPUT TEST  (type q to quit)")
    print("=" * 60)

    categories = ["field_crops", "vegetables", "flowers"]
    print("  Categories: %s" % ", ".join(categories))

    while True:
        print()
        cat = input("  Category [field_crops]: ").strip() or "field_crops"
        if cat.lower() == 'q':
            break
        if cat not in categories:
            print("  [!] Invalid. Choose: %s" % categories)
            continue

        try:
            N  = float(input("  Nitrogen   (kg/ha) : "))
            P  = float(input("  Phosphorus (kg/ha) : "))
            K  = float(input("  Potassium  (kg/ha) : "))
            T  = float(input("  Temperature   (C)  : "))
            H  = float(input("  Humidity       (%) : "))
            ph = float(input("  Soil pH            : "))
            R  = float(input("  Rainfall      (mm) : "))
        except ValueError:
            print("  [!] Invalid number.")
            continue

        pred, conf, alts = predict(cat, N, P, K, T, H, ph, R)
        if pred is None:
            print("  [!] Model not found for '%s'. Run --train first." % cat)
            continue

        print("\n  >> Recommended Crop : %s" % pred.upper())
        print("     Confidence      : %.2f%%" % conf)
        print("     Alternatives    : %s" % ", ".join(alts))

        again = input("\n  Test another? [y/n]: ").strip().lower()
        if again != 'y':
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Krishi-AI Crop Model Test Script")
    parser.add_argument("--train",       action="store_true", help="Force retrain all models")
    parser.add_argument("--test",        action="store_true", help="Run sample tests only")
    parser.add_argument("--accuracy",    action="store_true", help="Show accuracy on full dataset")
    parser.add_argument("--interactive", action="store_true", help="Enter custom inputs")
    args = parser.parse_args()

    run_all     = not any([args.train, args.test, args.accuracy, args.interactive])
    models_exist = (MODEL_DIR / "crop_model_field_crops.pkl").exists()

    if args.train or (run_all and not models_exist):
        run_training()

    if not models_exist and not args.train:
        print("\n  [!] Models not found. Run with --train first:")
        print("       .venv\\Scripts\\python.exe test_crop.py --train")
        sys.exit(1)

    if args.test or run_all:
        run_sample_tests()

    if args.accuracy or run_all:
        run_accuracy()

    if args.interactive or run_all:
        run_interactive()
