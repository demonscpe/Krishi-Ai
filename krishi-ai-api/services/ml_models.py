"""Central ML model loading and management.
All heavy imports (tensorflow, keras) are lazy-loaded to keep startup fast.
"""
import os
import pickle
import joblib
import numpy as np
import pandas as pd
from config import MODEL_DIR

# ---- Lazy-loading cache ----
_models: dict = {}


def _load_pickle(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)


def _load_joblib(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


def get_crop_recommendation_model():
    key = "crop_recommendation"
    if key not in _models:
        _models[key] = _load_pickle("crop_recommendation.pkl")
    return _models[key]


def get_fertilizer_model():
    key = "fertilizer"
    if key not in _models:
        _models[key] = _load_pickle("fertilizer.pkl")
    return _models[key]


def get_classifier_model():
    key = "classifier"
    if key not in _models:
        _models[key] = _load_pickle("classifier.pkl")
    return _models[key]


def get_soil_quality_model():
    key = "soil_quality"
    if key not in _models:
        _models[key] = _load_pickle("soil_quality.pkl")
    return _models[key]


def get_crop_rotation_model():
    key = "crop_rotation"
    if key not in _models:
        _models[key] = joblib.load(MODEL_DIR / "crop_rotation_recommendation_model.pkl")
    return _models[key]


def get_category_model(category: str):
    key = f"crop_model_{category}"
    if key not in _models:
        model_path = MODEL_DIR / f"crop_model_{category}.pkl"
        le_path = MODEL_DIR / f"crop_le_{category}.pkl"
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found for category: {category}")
        _models[key] = {
            "model": joblib.load(model_path),
            "le": joblib.load(le_path),
        }
    return _models[key]


def get_tflite_interpreter(model_name: str = "plant_disease_model.tflite"):
    import tensorflow as tf
    key = f"tflite_{model_name}"
    if key not in _models:
        path = MODEL_DIR / model_name
        if not path.exists():
            raise FileNotFoundError(f"TFLite model not found: {path}")
        interpreter = tf.lite.Interpreter(model_path=str(path))
        interpreter.allocate_tensors()
        _models[key] = interpreter
    return _models[key]


def get_keras_model(model_name: str):
    import tensorflow as tf
    key = f"keras_{model_name}"
    if key not in _models:
        path = MODEL_DIR / model_name
        if not path.exists():
            raise FileNotFoundError(f"Keras model not found: {path}")
        _models[key] = tf.keras.models.load_model(str(path), compile=False)
    return _models[key]


def get_mushroom_model():
    key = "mushroom"
    if key not in _models:
        _models[key] = _load_pickle("models/model.pkl")
    return _models[key]


def get_mushroom_encoders():
    key = "mushroom_encoders"
    if key not in _models:
        _models[key] = _load_pickle("models/encoders.pkl")
    return _models[key]


def get_seed_quality_model():
    key = "seed_quality"
    if key not in _models:
        _models[key] = tf.keras.models.load_model(str(MODEL_DIR / "seed_quality_predict.h5"), compile=False)
    return _models[key]


def clear_models():
    """Clear all loaded models (useful for testing)."""
    _models.clear()

