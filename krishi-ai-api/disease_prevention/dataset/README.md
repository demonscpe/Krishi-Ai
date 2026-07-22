# Disease Prevention Dataset

## Description
Maps (disease, plant, season) → prevention measures with effectiveness scores.
Used to train a classifier for disease prevention recommendations.

## Real-World Data Sources
- ICAR crop protection guidelines
- State agriculture department advisories
- FAO integrated pest management resources

## Columns
- disease: Disease name
- plant: Crop/plant type
- season: Kharif | Rabi | Zaid
- prevention_measure: Specific prevention action
- prevention_type: Cultural | Chemical | Biological | Integrated
- effectiveness: 0-1 effectiveness score

## How to Replace with Real Data
Delete `prevention_dataset.csv` and replace with real agricultural advisory data.

