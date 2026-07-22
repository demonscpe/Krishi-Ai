# Disease Report Dataset

## Description
The report generator uses Python's built-in text formatting to create
disease analysis reports. No ML model is required for PDF generation.

## Report Contents
A disease report includes:
1. Plant name and detected disease
2. Confidence and severity level
3. Disease description and causes
4. Treatment recommendations (chemical + organic)
5. Prevention measures
6. Risk assessment

## Future Enhancement
For advanced PDF generation, consider:
- reportlab: Full-featured PDF generation with charts/tables
- weasyprint: HTML-to-PDF with CSS styling
- matplotlib: Add severity trend charts

## How to Customize
Modify `service.py` to change report content or formatting.

