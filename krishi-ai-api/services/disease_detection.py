"""Plant disease detection service (TFLite + Keras models)."""
import numpy as np
from services.ml_models import get_tflite_interpreter
from utils.image_utils import preprocess_for_tflite

CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
    'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
    'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]


async def predict_disease(image_bytes: bytes) -> str | None:
    """Predict plant disease from an image using TFLite model."""
    try:
        interpreter = get_tflite_interpreter()
        if interpreter is None:
            return None  # Model not available — return None gracefully

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        input_arr = preprocess_for_tflite(image_bytes)
        interpreter.set_tensor(input_details[0]['index'], input_arr)
        interpreter.invoke()

        output_data = interpreter.get_tensor(output_details[0]['index'])
        result_index = int(np.argmax(output_data))

        if 0 <= result_index < len(CLASS_NAMES):
            return CLASS_NAMES[result_index]
        return None
    except Exception as e:
        raise Exception(f"Disease prediction failed: {str(e)}")

