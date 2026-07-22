"""Soil Test Input service - stores and manages soil test values."""

# In-memory store for latest soil test values (replace with DB in production)
_latest_soil_test = {}


def save_soil_test(data: dict) -> dict:
    """Save soil test values (to in-memory store - replace with DB)."""
    global _latest_soil_test
    _latest_soil_test = {
        "nitrogen": data["nitrogen"],
        "phosphorus": data["phosphorus"],
        "potassium": data["potassium"],
        "ph": data["ph"],
        "organic_carbon": data["organic_carbon"],
        "ec": data["ec"],
    }
    
    return {
        **data,
        "id": 1,
        "message": "Soil test values saved successfully.",
    }


def get_latest_soil_test() -> dict:
    """Retrieve the latest saved soil test values."""
    if not _latest_soil_test:
        raise ValueError("No soil test values found. Please save soil test values first.")
    return {
        **_latest_soil_test,
    }

