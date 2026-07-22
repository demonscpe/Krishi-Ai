# Fertilizer Recommendation Dataset

## Description
Maps (crop_type, soil_npk_levels, deficiency_type) → recommended fertilizer.
Used to train an XGBoost classifier for fertilizer type selection.

## Real-World Data Sources (for production replacement)
- ICAR Fertilizer Recommendation Guidelines: https://icar.org.in/
- State agriculture department fertilizer schedules
- IFFCO/KRIBHCO fertilizer product data

## Columns
- nitrogen (kg/ha)
- phosphorus (kg/ha)
- potassium (kg/ha)
- crop_type: Wheat, Rice, Maize, Cotton, Sugarcane, etc.
- soil_type: Loamy, Clayey, Sandy, Saline
- recommended_fertilizer: Urea, DAP, MOP, SSP, NPK_Complex, etc.
- quantity_kg_per_acre: float

## How to Replace with Real Data
1. Collect real agronomy trial data with fertilizer recommendations
2. Format as CSV matching the columns above
3. Delete `fertilizer_dataset.csv` and replace with your file
4. Re-run `python -m fertilizer_recommendation.trainer`

