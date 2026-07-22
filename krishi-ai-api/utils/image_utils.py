"""Image processing utilities."""
import io
import numpy as np
from PIL import Image


def load_image_bytes(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """Load, resize and normalize an image from bytes."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    input_arr = np.array(image)
    input_arr = np.expand_dims(input_arr, axis=0).astype(np.float32) / 255.0
    return input_arr


def load_image_grayscale(image_path: str, target_size: int = 120) -> np.ndarray:
    """Load image in grayscale, resize and normalize."""
    img = Image.open(image_path).convert("L")
    img = img.resize((target_size, target_size))
    arr = np.array(img) / 255.0
    return arr.reshape(-1, target_size, target_size, 1)


def preprocess_for_tflite(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """Preprocess image for TFLite model inference."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    input_arr = np.array(image)
    input_arr = np.expand_dims(input_arr, axis=0).astype(np.float32) / 255.0
    return input_arr

