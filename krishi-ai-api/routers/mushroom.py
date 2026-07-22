"""Mushroom edibility prediction router."""
import pickle
import pandas as pd
from fastapi import APIRouter, HTTPException, Form
from config import MODEL_DIR
from services.ml_models import get_mushroom_model, get_mushroom_encoders

router = APIRouter(tags=["Mushroom"], prefix="/api/mushroom")

# Mapping from Agrotech AI's maps.py
CAP_SHAPE = {'bell': 'b', 'conical': 'c', 'convex': 'x', 'flat': 'f', 'knobbed': 'k', 'sunken': 's'}
CAP_SURFACE = {'fibrous': 'f', 'grooves': 'g', 'scaly': 'y', 'smooth': 's'}
CAP_COLOR = {'brown': 'n', 'buff': 'b', 'cinnamon': 'c', 'gray': 'g', 'green': 'r', 'pink': 'p', 'purple': 'u', 'red': 'e', 'white': 'w', 'yellow': 'y'}
BRUISES = {'bruises': 't', 'no bruises': 'f'}
ODOR = {'almond': 'a', 'anise': 'l', 'creosote': 'c', 'fishy': 'y', 'foul': 'f', 'musty': 'm', 'none': 'n', 'pungent': 'p', 'spicy': 's'}
GILL_ATTACHMENT = {'attached': 'a', 'free': 'f'}
GILL_SPACING = {'close': 'c', 'crowded': 'w'}
GILL_SIZE = {'broad': 'b', 'narrow': 'n'}
GILL_COLOR = {'black': 'k', 'brown': 'n', 'buff': 'b', 'chocolate': 'h', 'gray': 'g', 'green': 'r', 'orange': 'o', 'pink': 'p', 'purple': 'u', 'red': 'e', 'white': 'w', 'yellow': 'y'}
STALK_SHAPE = {'enlarging': 'e', 'tapering': 't'}
STALK_ROOT = {'bulbous': 'b', 'club': 'c', 'equal': 'e', 'rooted': 'r', 'missing': '?'}
STALK_SURFACE_ABOVE = {'fibrous': 'f', 'scaly': 'y', 'silky': 'k', 'smooth': 's'}
STALK_SURFACE_BELOW = {'fibrous': 'f', 'scaly': 'y', 'silky': 'k', 'smooth': 's'}
STALK_COLOR_ABOVE = {'brown': 'n', 'buff': 'b', 'cinnamon': 'c', 'gray': 'g', 'orange': 'o', 'pink': 'p', 'red': 'e', 'white': 'w', 'yellow': 'y'}
STALK_COLOR_BELOW = {'brown': 'n', 'buff': 'b', 'cinnamon': 'c', 'gray': 'g', 'orange': 'o', 'pink': 'p', 'red': 'e', 'white': 'w', 'yellow': 'y'}
VEIL_TYPE = {'partial': 'p'}
VEIL_COLOR = {'brown': 'n', 'orange': 'o', 'white': 'w', 'yellow': 'y'}
RING_NUMBER = {'none': 'n', 'one': 'o', 'two': 't'}
RING_TYPE = {'evanescent': 'e', 'flaring': 'f', 'large': 'l', 'none': 'n', 'pendant': 'p'}
SPORE_PRINT_COLOR = {'black': 'k', 'brown': 'n', 'buff': 'b', 'chocolate': 'h', 'green': 'r', 'orange': 'o', 'purple': 'u', 'white': 'w', 'yellow': 'y'}
POPULATION = {'abundant': 'a', 'clustered': 'c', 'numerous': 'n', 'scattered': 's', 'several': 'v', 'solitary': 'y'}
HABITAT = {'grasses': 'g', 'leaves': 'l', 'meadows': 'm', 'paths': 'p', 'urban': 'u', 'waste': 'w', 'woods': 'd'}

MAPPINGS = {
    'cap-shape': CAP_SHAPE, 'cap-surface': CAP_SURFACE, 'cap-color': CAP_COLOR,
    'bruises': BRUISES, 'odor': ODOR, 'gill-attachment': GILL_ATTACHMENT,
    'gill-spacing': GILL_SPACING, 'gill-size': GILL_SIZE, 'gill-color': GILL_COLOR,
    'stalk-shape': STALK_SHAPE, 'stalk-root': STALK_ROOT,
    'stalk-surface-above-ring': STALK_SURFACE_ABOVE,
    'stalk-surface-below-ring': STALK_SURFACE_BELOW,
    'stalk-color-above-ring': STALK_COLOR_ABOVE,
    'stalk-color-below-ring': STALK_COLOR_BELOW,
    'veil-type': VEIL_TYPE, 'veil-color': VEIL_COLOR,
    'ring-number': RING_NUMBER, 'ring-type': RING_TYPE,
    'spore-print-color': SPORE_PRINT_COLOR,
    'population': POPULATION, 'habitat': HABITAT
}


@router.post("/edibility")
async def check_mushroom_edibility(
    cap_shape: str = Form(...), cap_surface: str = Form(...), cap_color: str = Form(...),
    bruises: str = Form(...), odor: str = Form(...), gill_attachment: str = Form(...),
    gill_spacing: str = Form(...), gill_size: str = Form(...), gill_color: str = Form(...),
    stalk_shape: str = Form(...), stalk_root: str = Form(...),
    stalk_surface_above_ring: str = Form(...), stalk_surface_below_ring: str = Form(...),
    stalk_color_above_ring: str = Form(...), stalk_color_below_ring: str = Form(...),
    veil_type: str = Form(...), veil_color: str = Form(...),
    ring_number: str = Form(...), ring_type: str = Form(...),
    spore_print_color: str = Form(...), population: str = Form(...), habitat: str = Form(...)
):
    """Check if a mushroom is edible or poisonous based on its characteristics."""
    try:
        data_dict = {}
        # Map form values
        form_data = {
            'cap-shape': cap_shape, 'cap-surface': cap_surface, 'cap-color': cap_color,
            'bruises': bruises, 'odor': odor, 'gill-attachment': gill_attachment,
            'gill-spacing': gill_spacing, 'gill-size': gill_size, 'gill-color': gill_color,
            'stalk-shape': stalk_shape, 'stalk-root': stalk_root,
            'stalk-surface-above-ring': stalk_surface_above_ring,
            'stalk-surface-below-ring': stalk_surface_below_ring,
            'stalk-color-above-ring': stalk_color_above_ring,
            'stalk-color-below-ring': stalk_color_below_ring,
            'veil-type': veil_type, 'veil-color': veil_color,
            'ring-number': ring_number, 'ring-type': ring_type,
            'spore-print-color': spore_print_color,
            'population': population, 'habitat': habitat
        }

        for key, mapping in MAPPINGS.items():
            value = form_data.get(key)
            if value:
                mapped = mapping.get(value)
                data_dict[key] = [mapped if mapped is not None else value]
            else:
                raise HTTPException(status_code=400, detail=f"Missing value: {key}")

        df = pd.DataFrame(data_dict)
        encoders = get_mushroom_encoders()

        for col in df.columns:
            if col in encoders:
                df[col] = encoders[col].transform(df[col])

        model = get_mushroom_model()
        prediction = model.predict(df)
        edibility = "Edible" if prediction[0] == 1 else "Poisonous"

        return {"edibility": edibility}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

