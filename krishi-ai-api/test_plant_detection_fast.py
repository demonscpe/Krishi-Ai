"""Focused test for plant detection route with mocked service (no network)."""
import io
import sys
import traceback
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent))

OUT = Path(__file__).resolve().parent / "plant_detection_test.txt"


def log(msg=""):
    print(msg)
    with open(OUT, "a", encoding="utf-8") as f:
        f.write(str(msg) + "\n")


# Clear output file
with open(OUT, "w", encoding="utf-8") as f:
    f.write("")

try:
    log("=== PLANT DETECTION TEST START ===")
    from main import app
    log("IMPORT main OK")

    # 1. Route registration
    plant_routes = [route.path for route in app.routes if "plant" in route.path.lower()]
    log(f"Plant routes: {plant_routes}")
    assert "/api/plant-identification" in plant_routes

    # Mock the service function that the ROUTER references
    mock_result = {
        "plant": "Tomato",
        "confidence": 97.5,
        "common_name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "family": "Solanaceae",
        "description": "A widely cultivated garden vegetable.",
        "health_status": "Diseased",
        "disease": "Early Blight",
        "disease_confidence": 88.2,
        "symptoms": "Brown spots on lower leaves with concentric rings.",
        "remedy": "Remove affected leaves and apply neem oil.",
        "source": "Test",
    }

    from fastapi.testclient import TestClient

    # Patch the router's reference (router does: from plant_identification.service import identify_plant)
    async def mock_identify(*a, **k):
        return mock_result

    with patch("plant_identification.router.identify_plant", new=mock_identify):
        client = TestClient(app)

        # Create a small valid JPEG
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (32, 32), color=(34, 139, 34)).save(buf, format="JPEG")
        img_bytes = buf.getvalue()

        # POST identify
        r = client.post(
            "/api/plant-identification",
            files={"images": ("tomato.jpg", img_bytes, "image/jpeg")},
        )
        log(f"POST /api/plant-identification -> {r.status_code}")
        log(f"Response JSON: {r.json()}")
        assert r.status_code == 200, f"Expected 200 got {r.status_code}: {r.text}"
        data = r.json()
        assert data["plant"] == "Tomato"
        assert data["disease"] == "Early Blight"
        assert data["health_status"] == "Diseased"
        log("✅ Response schema correct (plant, disease, health_status)")

        # Invalid file type
        r2 = client.post(
            "/api/plant-identification",
            files={"images": ("test.txt", b"hello", "text/plain")},
        )
        log(f"POST invalid type -> {r2.status_code}")
        assert r2.status_code == 400
        log("✅ Invalid file type rejected with 400")

        # Empty upload
        r3 = client.post("/api/plant-identification")
        log(f"POST empty -> {r3.status_code}")

    log("")
    log("ALL PLANT DETECTION ROUTE TESTS PASSED ✅")

    # 2. Test service fallback logic (local DB) without network
    log("")
    log("=== SERVICE FALLBACK TEST ===")
    import asyncio
    from plant_identification import service as svc

    async def run_fallback():
        with patch.object(svc, "_call_openai_vision", side_effect=RuntimeError("no api key")), \
             patch.object(svc, "_call_groq_vision", side_effect=RuntimeError("no groq")):
            # Use a valid image
            from PIL import Image
            buf = io.BytesIO()
            Image.new("RGB", (16, 16), color=(255, 0, 0)).save(buf, format="JPEG")
            return await svc.identify_plant(buf.getvalue(), "test.jpg")

    result = asyncio.run(run_fallback())
    log(f"Fallback result: {result}")
    assert result["plant"], "Fallback should return a plant name"
    assert result["source"] == "Local Database"
    assert result["confidence"] is not None
    log("✅ Service fallback to Local Database works")

    log("")
    log("ALL PLANT DETECTION TESTS PASSED ✅✅")

except Exception:
    log("EXCEPTION:")
    log(traceback.format_exc())

