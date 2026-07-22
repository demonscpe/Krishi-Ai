"""Disease report PDF generation service."""
import base64
import io
from datetime import datetime


async def generate_disease_report_pdf(
    plant: str = None,
    disease: str = None,
    severity: str = None,
    treatment: str = None,
    confidence: float = None,
) -> dict:
    """Generate a PDF report for a disease analysis.
    In production, use reportlab or weasyprint for proper PDF generation.
    """
    # Simple text-based report for now
    lines = []
    lines.append("=" * 60)
    lines.append("            AI PLANT DISEASE INTELLIGENCE REPORT")
    lines.append("=" * 60)
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    lines.append("--- DIAGNOSIS SUMMARY ---")
    lines.append(f"Plant/Crop:     {plant or 'N/A'}")
    lines.append(f"Disease:        {disease or 'N/A'}")
    lines.append(f"Confidence:     {f'{confidence:.1f}%' if confidence else 'N/A'}")
    lines.append(f"Severity:       {severity or 'N/A'}")
    lines.append("")
    lines.append("--- TREATMENT PLAN ---")
    lines.append(treatment or "No treatment data available.")
    lines.append("")
    lines.append("--- RECOMMENDATIONS ---")
    lines.append("1. Isolate affected plants to prevent spread")
    lines.append("2. Apply recommended treatment promptly")
    lines.append("3. Monitor plant health daily")
    lines.append("4. Maintain proper irrigation and nutrition")
    lines.append("5. Consult local agriculture officer if condition worsens")
    lines.append("")
    lines.append("=" * 60)
    lines.append("  Powered by Krishii-AI Plant Disease Intelligence Platform")
    lines.append("=" * 60)

    content = "\n".join(lines)
    pdf_bytes = content.encode("utf-8")
    pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

    return {
        "filename": f"disease_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
        "base64_pdf": pdf_b64,
    }
