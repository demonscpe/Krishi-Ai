# Disease Severity Dataset

## Description
Sample dataset mapping disease severity percentage based on plant, disease type, and visual indicators.

## Columns
- plant: Crop/plant type
- disease: Disease name
- severity_percentage: 0-1 (target)
- risk_level: Low | Medium | High | Severe
- affected_area: Proportion of plant affected
- leaf_coverage: Leaf area affected
- stem_damage: Stem damage proportion
- root_health: Root health score

## How to Replace with Real Data
1. Collect real disease severity assessments from agronomists
2. Format as CSV matching the columns above
3. Re-run `python -m disease_severity.trainer`

