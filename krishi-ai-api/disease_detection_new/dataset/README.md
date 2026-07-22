# Disease Detection Dataset

## Description
Sample dataset mapping plant image features (RGB shifts) to disease type.
Used to train a RandomForest classifier for disease detection.

## Real-World Data Sources (for production replacement)
- PlantVillage dataset: https://plantvillage.psu.edu/
- Kaggle plant disease datasets
- ICAR crop disease repositories

## Columns
- avg_r, avg_g, avg_b: Mean RGB values indicating disease discoloration
- plant: Tomato, Potato, Rice, etc.
- disease: Detected disease name
- severity: 0-1 severity score
- is_healthy: Binary flag (1=healthy)

## How to Replace with Real Data
1. Collect real diseased plant images with labels
2. Extract image features (color histograms, disease spots)
3. Format as CSV matching the columns above
4. Delete `disease_dataset.csv` and replace with your file
5. Re-run `python -m disease_detection_new.trainer`

