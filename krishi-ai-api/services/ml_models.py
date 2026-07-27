"""Central ML model loading and management.
All heavy imports (tensorflow, keras) are lazy-loaded to keep startup fast.
Now with graceful fallbacks — missing models return None and log a warning
instead of crashing the server.
"""
import os
import pickle
import logging
import warnings
import joblib
import numpy as np
import pandas as pd
from config import MODEL_DIR

logger = logging.getLogger(__name__)


# ---- Lazy-loading cache ----
_models: dict = {}


def _load_pickle(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        # Check for common alternative names
        alt_name = _find_alternative(name)
        if alt_name:
            path = MODEL_DIR / alt_name
        else:
            logger.warning(f"Model file not found: {path} — returning None")
            return None
    with open(path, "rb") as f:
        return pickle.load(f)


def _load_joblib(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        alt_name = _find_alternative(name)
        if alt_name:
            path = MODEL_DIR / alt_name
        else:
            logger.warning(f"Model file not found: {path} — returning None")
            return None
    return joblib.load(path)


def _find_alternative(name: str) -> str | None:
    """Map known model file references to actual files in the models directory."""
    alt_map = {
        "crop_recommendation.pkl": "crop_model_field_crops.pkl",
        "fertilizer.pkl": "fertilizer_recommendation_model.pkl",
        "classifier.pkl": "fertilizer_recommendation_model.pkl",
        "soil_quality.pkl": "soil_health_model.pkl",
        "crop_rotation_recommendation_model.pkl": None,
        "plant_disease_model.tflite": None,
        "models/model.pkl": None,
        "models/encoders.pkl": None,
        "seed_quality_predict.h5": None,
        "irrigation_model.pkl": None,
        "label_encoder.pkl": None,
    }
    return alt_map.get(name)


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
        _models[key] = _load_joblib("crop_rotation_recommendation_model.pkl")
    return _models[key]


def get_category_model(category: str):
    key = f"crop_model_{category}"
    if key not in _models:
        model_path = MODEL_DIR / f"crop_model_{category}.pkl"
        le_path = MODEL_DIR / f"crop_le_{category}.pkl"
        if not model_path.exists():
            logger.warning(f"Model not found for category: {category} — returning None")
            return None
        _models[key] = {
            "model": joblib.load(model_path),
            "le": joblib.load(le_path),
        }
    return _models[key]


def get_tflite_interpreter(model_name: str = "plant_disease_model.tflite"):
    key = f"tflite_{model_name}"
    if key not in _models:
        path = MODEL_DIR / model_name
        if not path.exists():
            logger.warning(f"TFLite model not found: {path} — returning None")
            return None
        try:
            import tensorflow as tf
            interpreter = tf.lite.Interpreter(model_path=str(path))
            interpreter.allocate_tensors()
            _models[key] = interpreter
        except Exception as e:
            logger.warning(f"Failed to load TFLite model: {e} — returning None")
            return None
    return _models[key]


def get_keras_model(model_name: str):
    key = f"keras_{model_name}"
    if key not in _models:
        path = MODEL_DIR / model_name
        if not path.exists():
            logger.warning(f"Keras model not found: {path} — returning None")
            return None
        try:
            import tensorflow as tf
            _models[key] = tf.keras.models.load_model(str(path), compile=False)
        except Exception as e:
            logger.warning(f"Failed to load Keras model: {e} — returning None")
            return None
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
        path = MODEL_DIR / "seed_quality_predict.h5"
        if path.exists():
            try:
                import tensorflow as tf
                _models[key] = tf.keras.models.load_model(str(path), compile=False)
            except Exception as e:
                logger.warning(f"Failed to load seed quality model: {e} — returning None")
                return None
        else:
            logger.warning(f"Seed quality model not found: {path} — returning None")
            return None
    return _models[key]


def clear_models():
    """Clear all loaded models (useful for testing)."""
    _models.clear()

