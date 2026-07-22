# Soil Health Analyzer Dataset

## Description
This dataset maps soil test values (NPK, pH, EC, OC) to a health score (0-100).
Used to train an XGBoost/RandomForest regressor.

## Real-World Data Sources (for production replacement)
- ICAR Soil Health Card data: https://soilhealth.dac.gov.in/
- State agricultural university soil test databases
- Krishi Bhavan soil testing lab records

## Columns
- nitrogen (kg/ha): 0-500
- phosphorus (kg/ha): 0-300
- potassium (kg/ha): 0-500
- ph: 0-14
- organic_carbon (%): 0-10
- ec (dS/m): 0-10
- health_score: 0-100 (target)

## How to Replace with Real Data
1. Collect real soil test records with expert-assigned health scores
2. Format as CSV matching the columns above
3. Delete `soil_health_dataset.csv` and replace with your file
4. Re-run `python -m soil_health_analyzer.trainer`

