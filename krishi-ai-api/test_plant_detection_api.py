"""Test the plant identification (Plant Detection) module."""
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from main import app


def make_test_image() -> bytes:
    """Create a small valid JPEG image in memory."""
    from PIL import Image
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), color=(34, 139, 34)).save(buf, format="JPEG")
    return buf.getvalue()


def main():
    client = TestClient(app)

    # 1. Route registration check
    plant_routes = [route.path for route in app.routes if "plant-identification" in route.path]
    print("Plant Identification routes:", plant_routes)
    assert len(plant_routes) > 0, "Plant identification route not registered!"

    # 2. Docs endpoint works
    r = client.get("/docs")
    print("Docs status:", r.status_code)
    assert r.status_code == 200

    # 3. POST /api/plant-identification with a valid image
    image_bytes = make_test_image()
    r = client.post(
        "/api/plant-identification",
        files={"images": ("test.jpg", image_bytes, "image/jpeg")},
    )
    print("Identify status:", r.status_code)
    print("Identify response:", r.json())
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    assert "plant" in data, "Response missing 'plant'"
    assert "confidence" in data, "Response missing 'confidence'"

    # 4. Invalid file type rejection
    r = client.post(
        "/api/plant-identification",
        files={"images": ("test.txt", b"not an image", "text/plain")},
    )
    print("Invalid type status:", r.status_code)
    assert r.status_code == 400

    print("\n✅ ALL PLANT DETECTION TESTS PASSED")


if __name__ == "__main__":
    main()

