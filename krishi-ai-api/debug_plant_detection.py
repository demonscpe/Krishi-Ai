"""Diagnostic test for plant detection module - writes results to a file."""
import io
import sys
import traceback
from pathlib import Path

OUT = Path(__file__).resolve().parent / "plant_detection_debug.txt"
sys.path.insert(0, str(Path(__file__).resolve().parent))

lines = []
def log(msg=""):
    lines.append(str(msg))
    print(msg)

try:
    from main import app
    log("IMPORT main OK")

    # Check routes
    plant_routes = [route.path for route in app.routes if "plant" in route.path.lower()]
    log(f"Plant-related routes: {plant_routes}")

    from fastapi.testclient import TestClient
    client = TestClient(app)

    # Docs
    r = client.get("/docs")
    log(f"GET /docs -> {r.status_code}")

    # Health check for plant identification
    # Create a small test image
    try:
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (32, 32), color=(34, 139, 34)).save(buf, format="JPEG")
        img_bytes = buf.getvalue()
        log(f"Created test image: {len(img_bytes)} bytes")
    except Exception as e:
        img_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 100
        log(f"PIL not available, using dummy: {e}")

    # POST identify
    r = client.post(
        "/api/plant-identification",
        files={"images": ("test.jpg", img_bytes, "image/jpeg")},
    )
    log(f"POST /api/plant-identification -> {r.status_code}")
    log(f"Response: {r.text[:500]}")

    # Invalid file type
    r2 = client.post(
        "/api/plant-identification",
        files={"images": ("test.txt", b"hello", "text/plain")},
    )
    log(f"POST invalid type -> {r2.status_code}")

except Exception:
    log("EXCEPTION:")
    log(traceback.format_exc())

OUT.write_text("\n".join(lines), encoding="utf-8")
log(f"\n[debug written to {OUT.name}]")

