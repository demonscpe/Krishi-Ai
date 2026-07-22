"""Plant identification service."""
import random


# Sample plant database for demo purposes
PLANT_DB = {
    "tomato": {"common_name": "Tomato", "scientific_name": "Solanum lycopersicum", "family": "Solanaceae", "description": "A widely cultivated garden vegetable, native to South America."},
    "potato": {"common_name": "Potato", "scientific_name": "Solanum tuberosum", "family": "Solanaceae", "description": "A starchy tuberous crop, one of the world's main food crops."},
    "rice": {"common_name": "Rice", "scientific_name": "Oryza sativa", "family": "Poaceae", "description": "A cereal grain, staple food for over half the world's population."},
    "cotton": {"common_name": "Cotton", "scientific_name": "Gossypium hirsutum", "family": "Malvaceae", "description": "A soft, fluffy fiber that grows in a boll, used for textiles."},
    "maize": {"common_name": "Maize/Corn", "scientific_name": "Zea mays", "family": "Poaceae", "description": "A cereal grain first domesticated by indigenous peoples in southern Mexico."},
    "wheat": {"common_name": "Wheat", "scientific_name": "Triticum aestivum", "family": "Poaceae", "description": "A grass widely cultivated for its seed, a staple food worldwide."},
    "apple": {"common_name": "Apple", "scientific_name": "Malus domestica", "family": "Rosaceae", "description": "A deciduous tree bearing pomaceous fruit, widely cultivated."},
    "grape": {"common_name": "Grape", "scientific_name": "Vitis vinifera", "family": "Vitaceae", "description": "A woody vine bearing fruits used for wine, juice, and fresh consumption."},
    "banana": {"common_name": "Banana", "scientific_name": "Musa acuminata", "family": "Musaceae", "description": "An elongated, edible fruit produced by large herbaceous flowering plants."},
    "mango": {"common_name": "Mango", "scientific_name": "Mangifera indica", "family": "Anacardiaceae", "description": "A tropical stone fruit, known as the king of fruits."},
}


async def identify_plant(image_bytes: bytes) -> dict:
    """Identify plant from image bytes.
    In production, replace with a real ML model (e.g. PlantNet API, MobileNet fine-tuned on plant species).
    """
    # Demo: return a random plant match with high confidence
    plant_key = random.choice(list(PLANT_DB.keys()))
    info = PLANT_DB[plant_key]
    confidence = round(random.uniform(85.0, 99.0), 1)

    return {
        "plant": plant_key.capitalize(),
        "confidence": confidence,
        "common_name": info["common_name"],
        "scientific_name": info["scientific_name"],
        "family": info["family"],
        "description": info["description"],
    }

