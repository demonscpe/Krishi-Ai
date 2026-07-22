"""Rule-based nutrient analysis for soil health assessment.
Defines optimal ranges, generates status, reasons, and recommendations per nutrient.
"""

NUTRIENT_RULES = {
    "Nitrogen": {
        "key": "nitrogen",
        "unit": "kg/ha",
        "optimal": (50, 150),
        "low": {
            "reason": "Continuous cultivation without adequate N replenishment",
            "recommendation": "Apply Urea (60-80 kg/acre) or organic compost (5-10 tons/acre)",
            "severity": "Moderate",
        },
        "high": {
            "reason": "Excessive fertilizer application or organic matter buildup",
            "recommendation": "Reduce N fertilizer by 30-50%. Plant N-scavenging cover crops like rye",
            "severity": "Moderate",
        },
        "optimal_reason": "Balanced nitrogen level supports healthy vegetative growth",
        "optimal_recommendation": "Maintain current fertilization practices. Side-dress with 30 kg/acre Urea at tillering",
    },
    "Phosphorus": {
        "key": "phosphorus",
        "unit": "kg/ha",
        "optimal": (20, 60),
        "low": {
            "reason": "Low organic matter content and acidic/alkaline soil conditions",
            "recommendation": "Apply DAP (50-60 kg/acre) or SSP (80-100 kg/acre). Use phosphate-solubilizing bacteria",
            "severity": "High",
        },
        "high": {
            "reason": "Excessive P fertilization or manure application",
            "recommendation": "Stop P application for 1-2 seasons. Avoid runoff into water bodies",
            "severity": "Low",
        },
        "optimal_reason": "Adequate phosphorus for root development and flowering",
        "optimal_recommendation": "Continue with balanced P application. Apply 25 kg/acre DAP at sowing",
    },
    "Potassium": {
        "key": "potassium",
        "unit": "kg/ha",
        "optimal": (30, 100),
        "low": {
            "reason": "Sandy soils with low CEC and intensive cropping without K replenishment",
            "recommendation": "Apply MOP (15-25 kg/acre) or wood ash (50-100 kg/acre). Use drip fertigation",
            "severity": "High",
        },
        "high": {
            "reason": "Excessive K fertilizer application",
            "recommendation": "Reduce K application by 50%. Monitor for Mg and Ca deficiencies",
            "severity": "Low",
        },
        "optimal_reason": "Good potassium level for stress tolerance and fruit quality",
        "optimal_recommendation": "Maintain K levels with 10-15 kg/acre MOP per season",
    },
    "pH": {
        "key": "ph",
        "unit": "",
        "optimal": (6.0, 7.5),
        "low": {
            "reason": "Acidic soil from excessive rainfall, leaching, or acid-forming fertilizers",
            "recommendation": "Apply agricultural lime (2-4 tons/acre) or dolomite. Use acid-tolerant varieties",
            "severity": "Critical",
        },
        "high": {
            "reason": "Alkaline soil in arid regions or from excessive liming",
            "recommendation": "Apply gypsum (1-2 tons/acre) or elemental sulfur. Use acidic fertilizers like ammonium sulfate",
            "severity": "Critical",
        },
        "optimal_reason": "Optimal pH range for nutrient availability and microbial activity",
        "optimal_recommendation": "Maintain with regular soil testing. Continue balanced fertilization",
    },
    "Organic Carbon": {
        "key": "organic_carbon",
        "unit": "%",
        "optimal": (0.75, 2.0),
        "low": {
            "reason": "Intensive tillage, low biomass return, and limited organic amendments",
            "recommendation": "Apply vermicompost (5-8 tons/acre). Grow green manure crops like Dhaincha. Reduce tillage",
            "severity": "High",
        },
        "high": {
            "reason": "Excessive organic matter addition or waterlogged conditions",
            "recommendation": "Balance C:N ratio. Aerate soil if waterlogged. Reduce fresh organic inputs",
            "severity": "Low",
        },
        "optimal_reason": "Good organic matter content for soil structure and water retention",
        "optimal_recommendation": "Continue adding compost (2-3 tons/acre) annually. Practice residue retention",
    },
    "Electrical Conductivity": {
        "key": "ec",
        "unit": "dS/m",
        "optimal": (0, 1.0),
        "low": None,  # Low EC is fine - indicates no salinity
        "high": {
            "reason": "High salt accumulation from irrigation water or excessive fertilization",
            "recommendation": "Apply gypsum (2-3 tons/acre). Leach with good quality water. Grow salt-tolerant crops",
            "severity": "Critical",
        },
        "optimal_reason": "No salinity issues. Safe for all crops",
        "optimal_recommendation": "Maintain current irrigation and fertilization practices",
    },
}


def analyze_nutrients(data: dict) -> tuple[list, float]:
    """Analyze all nutrients against optimal ranges.
    
    Returns:
        tuple of (breakdown list, total score 0-100)
    """
    breakdown = []
    total_score = 0
    
    for nutrient_name, rules in NUTRIENT_RULES.items():
        key = rules["key"]
        raw_value = data.get(key)
        if raw_value is None:
            continue
        
        value = float(raw_value)
        lo, hi = rules["optimal"]
        
        if lo <= value <= hi:
            status = "Optimal"
            reason = rules["optimal_reason"]
            recommendation = rules["optimal_recommendation"]
            nutrient_score = 100
        elif value < lo:
            status = "Low"
            low_info = rules["low"]
            reason = low_info["reason"]
            recommendation = low_info["recommendation"]
            # Score proportional to how far below optimal
            nutrient_score = max(20, int((value / lo) * 60))
        else:
            if rules.get("high"):
                status = "High"
                high_info = rules["high"]
                reason = high_info["reason"]
                recommendation = high_info["recommendation"]
                # Score decreases as value goes above optimal
                excess_ratio = (value - hi) / hi
                nutrient_score = max(20, int(80 * (1 - excess_ratio)))
            else:
                # e.g., low EC is optimal
                status = "Optimal"
                reason = rules["optimal_reason"]
                recommendation = rules["optimal_recommendation"]
                nutrient_score = 100
        
        display_value = f"{value} {rules['unit']}".strip() if rules['unit'] else str(value)
        
        severity = None
        if status != "Optimal":
            severity = rules.get("low" if status == "Low" else "high", {}).get("severity")
        
        breakdown.append({
            "nutrient": nutrient_name,
            "value": display_value,
            "status": status,
            "reason": reason,
            "recommendation": recommendation,
            "severity": severity,
        })
        
        total_score += nutrient_score
    
    # Average score across all nutrients
    overall_score = round(total_score / max(len(breakdown), 1), 1)
    overall_score = max(0, min(100, overall_score))
    
    return breakdown, overall_score


def generate_summary(score: float, breakdown: list) -> str:
    """Generate a high-level summary based on health score."""
    if score >= 80:
        return "Your soil is in excellent health! All nutrient levels are well-balanced. Continue your current management practices and test again next season."
    elif score >= 60:
        low_nutrients = [b["nutrient"] for b in breakdown if b["status"] != "Optimal"]
        if low_nutrients:
            return f"Your soil health is good but can be improved. Focus on optimizing {', '.join(low_nutrients)}. Follow the recommendations below for these nutrients."
        return "Your soil health is moderate. Consider implementing the recommendations to improve soil fertility."
    else:
        poor_nutrients = [b["nutrient"] for b in breakdown if b["status"] == "Low"]
        if poor_nutrients:
            return f"Your soil needs attention. {', '.join(poor_nutrients)} levels are low. Prioritize the recommendations for these nutrients and consider a comprehensive soil amendment plan."
        return "Your soil health needs significant improvement. Follow all recommendations closely and retest after one season."

