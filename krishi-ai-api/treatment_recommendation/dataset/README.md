# Treatment Recommendation Dataset

## Description
Maps (disease, severity) → chemical + organic treatment options with dosage.
Used to train a classifier + rule-based system.

## Real-World Data Sources (for production replacement)
- ICAR crop protection guidelines
- State agriculture department pest management schedules
- Pesticide manufacturer data sheets

## Columns
- disease: Early Blight, Late Blight, Powdery Mildew, etc.
- severity: 0-1 severity score
- chemical_treatment: Recommended chemical
- organic_treatment: Recommended organic alternative
- chemical_dosage: Application rate
- organic_dosage: Application rate
- duration_days: Treatment duration
- efficacy: Expected efficacy (%)

## How to Replace with Real Data
1. Collect real agronomy treatment records
2. Format as CSV matching the columns above
3. Delete `treatment_dataset.csv` and replace with your file
4. Re-run `python -m treatment_recommendation.trainer`

