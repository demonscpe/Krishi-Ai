import re

file = r'c:\Users\rajes\OneDrive\Desktop\Krishi-Ai\Krishi-Ai\frontend\src\components\models\CropRecommendation.jsx'

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix corrupted emoji labels
content = content.replace("label: 'dYO_ Field Crops'", "label: '\U0001f33e Field Crops'")
content = content.replace("label: 'dY\u6631 Vegetables'", "label: '\U0001f966 Vegetables'")
content = content.replace("label: 'dYO, Flowers'", "label: '\U0001f338 Flowers'")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
