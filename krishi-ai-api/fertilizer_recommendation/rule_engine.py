"""Rule-based fertilizer recommendation engine.
Combines NPK deficiency analysis with crop-specific rules.
In production, replace with XGBoost classifier + rule-based quantity calculator.
"""

# Deficiency thresholds (low/optimal/high for each nutrient)
DEFICIENCY_THRESHOLDS = {
    "nitrogen": {"low": 50, "optimal": 150},
    "phosphorus": {"low": 20, "optimal": 60},
    "potassium": {"low": 30, "optimal": 100},
}

# Fertilizer recommendations by (nutrient, deficiency_level)
FERTILIZER_MAP = {
    "nitrogen": {
        "low": [
            {"name": "Urea", "quantity_per_acre": "50-60 kg", "type": "Chemical",
             "notes": "Apply in 2 splits: 50% basal, 50% at tillering stage"},
            {"name": "DAP", "quantity_per_acre": "25-30 kg", "type": "Chemical",
             "notes": "Provides both N and P. Apply at sowing time"},
            {"name": "Vermicompost", "quantity_per_acre": "5-8 tons", "type": "Organic",
             "notes": "Apply 15 days before sowing for best results"},
        ],
        "optimal": [
            {"name": "Urea", "quantity_per_acre": "20-30 kg", "type": "Chemical",
             "notes": "Maintenance dose. Apply at tillering stage"},
        ],
        "high": [
            {"name": "No N fertilizer needed", "quantity_per_acre": "0 kg", "type": None,
             "notes": "N levels are sufficient. Avoid additional N application this season"},
        ],
    },
    "phosphorus": {
        "low": [
            {"name": "DAP", "quantity_per_acre": "50-60 kg", "type": "Chemical",
             "notes": "Apply basal at sowing time. Works best in neutral pH"},
            {"name": "SSP", "quantity_per_acre": "80-100 kg", "type": "Chemical",
             "notes": "Also provides sulfur. Good for acidic soils"},
            {"name": "Bone meal", "quantity_per_acre": "50-75 kg", "type": "Organic",
             "notes": "Slow-release. Apply 2 weeks before sowing"},
        ],
        "optimal": [
            {"name": "DAP", "quantity_per_acre": "25 kg", "type": "Chemical",
             "notes": "Maintenance dose at sowing time"},
        ],
        "high": [
            {"name": "No P fertilizer needed", "quantity_per_acre": "0 kg", "type": None,
             "notes": "P levels are sufficient. Avoid P application to prevent runoff pollution"},
        ],
    },
    "potassium": {
        "low": [
            {"name": "MOP (Muriate of Potash)", "quantity_per_acre": "15-25 kg", "type": "Chemical",
             "notes": "Apply at sowing or early growth stage"},
            {"name": "SOP (Sulfate of Potash)", "quantity_per_acre": "12-20 kg", "type": "Chemical",
             "notes": "Best for chloride-sensitive crops. Also provides sulfur"},
            {"name": "Wood ash", "quantity_per_acre": "50-100 kg", "type": "Organic",
             "notes": "Also raises pH. Good for acidic soils"},
        ],
        "optimal": [
            {"name": "MOP", "quantity_per_acre": "10-15 kg", "type": "Chemical",
             "notes": "Maintenance dose at sowing time"},
        ],
        "high": [
            {"name": "No K fertilizer needed", "quantity_per_acre": "0 kg", "type": None,
             "notes": "K levels are sufficient. Avoid additional potash"},
        ],
    },
}

# Default application schedule (adjust per crop in production)
DEFAULT_SCHEDULE = [
    {"stage": "Basal (at sowing)", "instruction": "Apply full P and K, and 50% of recommended N"},
    {"stage": "Tillering / Early growth", "instruction": "Apply 25% of recommended N"},
    {"stage": "Flowering / Mid-growth", "instruction": "Apply remaining N (25%). Foliar spray of micronutrients if needed"},
]


def get_deficiency_level(value: float, nutrient: str) -> str:
    """Determine deficiency level for a nutrient."""
    thresholds = DEFICIENCY_THRESHOLDS.get(nutrient, {"low": 30, "optimal": 100})
    if value < thresholds["low"]:
        return "low"
    elif value <= thresholds["optimal"]:
        return "optimal"
    return "high"


def recommend_fertilizers(soil_data: dict) -> list:
    """Recommend fertilizers based on soil NPK values."""
    recommendations = []
    
    for nutrient in ["nitrogen", "phosphorus", "potassium"]:
        value = soil_data.get(nutrient, 0)
        level = get_deficiency_level(value, nutrient)
        ferts = FERTILIZER_MAP.get(nutrient, {}).get(level, [])
        recommendations.extend(ferts)
    
    # Deduplicate by name
    seen = set()
    unique = []
    for r in recommendations:
        if r["name"] not in seen:
            seen.add(r["name"])
            unique.append(r)
    
    return unique


def generate_soil_summary(soil_data: dict) -> str:
    """Generate a brief soil context summary."""
    texts = []
    for nutrient, thresholds in DEFICIENCY_THRESHOLDS.items():
        value = soil_data.get(nutrient, 0)
        if value < thresholds["low"]:
            texts.append(f"{nutrient.capitalize()} is deficient ({value})")
        elif value > thresholds["optimal"]:
            texts.append(f"{nutrient.capitalize()} is high ({value})")
    
    if texts:
        return "Soil analysis shows: " + "; ".join(texts) + "."
    return "Soil NPK levels are well-balanced."

