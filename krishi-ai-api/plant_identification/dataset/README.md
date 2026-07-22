# Plant Identification Dataset

## Description
Sample dataset mapping image features (RGB, leaf shape, texture) to plant types.
Used to train a RandomForest classifier for plant identification.

## Real-World Data Sources (for production replacement)
- PlantVillage dataset: https://plantvillage.psu.edu/
- LeafSnap plant database
- iNaturalist plant images

## Columns
- avg_r, avg_g, avg_b: Mean RGB values (0-255)
- leaf_ratio: Estimated leaf area ratio
- texture: smooth | rough | glossy
- shape: oval | round | elongated | heart
- plant: Target plant name

## How to Replace with Real Data
1. Collect real plant images with labels
2. Extract image features (color histograms, texture, shape)
3. Format as CSV matching the columns above
4. Delete `plant_dataset.csv` and replace with your file
5. Re-run `python -m plant_identification.trainer`

