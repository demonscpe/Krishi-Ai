"""3-year crop rotation plan service."""

CROP_PROFILE = {
    "Chickpea":  {"season": "Rabi",   "months": "Oct-Mar", "family": "Legume",  "base_yield": 1.8, "water": "Low",  "nitrogen": -5,  "restores_n": True,  "depletes_p": False, "sow": "October",  "harvest": "March"},
    "Mustard":   {"season": "Rabi",   "months": "Oct-Nov", "family": "Oilseed", "base_yield": 1.5, "water": "Low",  "nitrogen": 0,   "restores_n": False, "depletes_p": True,  "sow": "October",  "harvest": "February"},
    "Wheat":     {"season": "Rabi",   "months": "Nov-Apr", "family": "Cereal",  "base_yield": 3.5, "water": "Med",  "nitrogen": -60, "restores_n": False, "depletes_p": True,  "sow": "November", "harvest": "April"},
    "Maize":     {"season": "Kharif", "months": "Jun-Sep", "family": "Cereal",  "base_yield": 6.0, "water": "Med",  "nitrogen": -80, "restores_n": False, "depletes_p": True,  "sow": "June",     "harvest": "September"},
    "Groundnut": {"season": "Kharif", "months": "Jun-Oct", "family": "Legume",  "base_yield": 2.0, "water": "Med",  "nitrogen": -10, "restores_n": True,  "depletes_p": True,  "sow": "June",     "harvest": "October"},
    "Soybean":   {"season": "Kharif", "months": "Jun-Sep", "family": "Legume",  "base_yield": 2.5, "water": "Med",  "nitrogen": 40,  "restores_n": True,  "depletes_p": False, "sow": "June",     "harvest": "September"},
    "Rice":      {"season": "Kharif", "months": "Jun-Oct", "family": "Cereal",  "base_yield": 5.0, "water": "High", "nitrogen": -70, "restores_n": False, "depletes_p": True,  "sow": "June",     "harvest": "October"},
}

ROTATION_CHAINS = {
    "Rice": ["Chickpea", "Wheat", "Mustard"],
    "Wheat": ["Soybean", "Mustard", "Maize"],
    "Cotton": ["Chickpea", "Mustard", "Wheat"],
    "Maize": ["Chickpea", "Wheat", "Mustard"],
    "Groundnut": ["Wheat", "Mustard", "Chickpea"],
    "Soybean": ["Wheat", "Mustard", "Groundnut"],
    "DEFAULT": ["Wheat", "Chickpea", "Mustard"],
}

MARKET_PRICE = {
    "Chickpea": 5800, "Mustard": 5650, "Wheat": 2600, "Maize": 2200,
    "Groundnut": 6200, "Soybean": 4800, "Rice": 2500,
}

COST_PER_HA = {
    "Chickpea": 28000, "Mustard": 22000, "Wheat": 35000, "Maize": 32000,
    "Groundnut": 40000, "Soybean": 30000, "Rice": 45000,
}


def _soil_health(prev_crop, chain):
    crops = [prev_crop] + chain
    health = 50
    for i, crop in enumerate(crops):
        p = CROP_PROFILE.get(crop)
        if not p:
            continue
        if p["family"] == "Legume":
            health += 15
        if i > 0:
            prev = CROP_PROFILE.get(crops[i - 1])
            if prev and prev["family"] == p["family"]:
                health -= 10
    return {
        "year0": min(100, max(0, health - 20)),
        "year1": min(100, max(0, health)),
        "year2": min(100, max(0, health + 10)),
        "year3": min(100, max(0, health + 15)),
    }


def _nutrient_balance(prev_crop, chain):
    crops = [prev_crop] + chain
    n, p, k = 0, 0, 0
    for crop in crops:
        prof = CROP_PROFILE.get(crop)
        if not prof:
            continue
        n += prof["nitrogen"]
        if prof.get("depletes_p"):
            p -= 15
        if prof.get("restores_n"):
            n += 50
    return {
        "nitrogen": round(min(100, max(0, 50 + n / 4)), 1),
        "phosphorus": round(min(100, max(0, 50 + p / 4)), 1),
        "potassium": round(min(100, max(0, 50)), 1),
    }


def _sustainability(chain):
    legumes = sum(1 for c in chain if CROP_PROFILE.get(c, {}).get("family") == "Legume")
    families = {CROP_PROFILE.get(c, {}).get("family") for c in chain}
    high_water = sum(1 for c in chain if CROP_PROFILE.get(c, {}).get("water") == "High")
    return {
        "fertilizer_reduction_pct": min(100, legumes * 35),
        "disease_suppression_pct": round((len(families) / 3) * 60),
        "water_efficiency_pct": max(30, 60 - high_water * 10) if high_water else 45,
    }


def _financial(chain):
    rotation, mono = 0, 0
    base_yield = CROP_PROFILE.get(chain[0], {}).get("base_yield", 3.0)
    for i, crop in enumerate(chain):
        price = MARKET_PRICE.get(crop, 3000)
        cost = COST_PER_HA.get(crop, 30000)
        y = base_yield * (0.85 + i * 0.125)
        rotation += y * 10 * price - cost
        mono_y = base_yield * (1 - i * 0.15)
        mono += mono_y * 10 * price - cost
    return {
        "rotation_profit": round(rotation),
        "monoculture_profit": round(mono),
        "rotation_advantage": round(rotation - mono),
    }


def build_plan(data: dict) -> dict:
    prev = data["previous_crop"].strip().title()
    chain = ROTATION_CHAINS.get(prev, ROTATION_CHAINS["DEFAULT"])
    soil = _soil_health(prev, chain)
    nutrients = _nutrient_balance(prev, chain)
    sustain = _sustainability(chain)
    financial = _financial(chain)

    year_plans = []
    health_keys = ["year1", "year2", "year3"]
    for i, crop in enumerate(chain):
        p = CROP_PROFILE.get(crop, {"season": "Rabi", "months": "—", "family": "Crop", "base_yield": 3.0, "sow": "—", "harvest": "—"})
        year_plans.append({
            "year": i + 1,
            "crop": crop,
            "season": p["season"],
            "months": p["months"],
            "family": p["family"],
            "base_yield": p["base_yield"],
            "soil_health_pct": soil[health_keys[i]],
            "sowing_month": p["sow"],
            "harvest_month": p["harvest"],
        })

    key_actions = [
        f"Prepare field 2-3 weeks before {year_plans[0]['sowing_month']} for {year_plans[0]['crop']} sowing.",
        f"Reduce synthetic fertilizers by ~{sustain['fertilizer_reduction_pct']}% using legume nitrogen fixation.",
        f"Monitor pests during transition months; rotation cuts disease by ~{sustain['disease_suppression_pct']}%.",
        f"Soil health expected to reach {soil['year3']}% by end of Year 3.",
        f"Rotation advantage over monoculture: ₹{financial['rotation_advantage']:,}/hectare over 3 years.",
    ]

    return {
        "previous_crop": prev,
        "year_plans": year_plans,
        "nutrient_balance": nutrients,
        "sustainability": sustain,
        "financial": financial,
        "key_actions": key_actions,
    }
