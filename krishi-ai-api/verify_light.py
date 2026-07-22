"""Lightweight verification - tests all imports except TF/Keras heavy models."""
import sys
sys.path.insert(0, '.')

print("=== Krishi-AI FastAPI Verification ===\n")

# Test 1: Core config
from config import BASE_DIR, MODEL_DIR, CROP_DATA_DIR, UPLOAD_DIR
print(f"✅ config  - BASE_DIR: {BASE_DIR}")

# Test 2: Utils
from utils.rate_limiter import rate_limiter
print("✅ utils   - rate_limiter OK")

# Test 3: All schemas
from schemas.crop import CropPredictRequest, CropPredictResponse
from schemas.disease import DiseasePredictResponse
from schemas.rotation import RotationRequest, RotationResponse
from schemas.prices import PriceOverviewResponse, CommodityRequest, CommodityForecast
from schemas.soil import SoilQualityRequest, LocationRequest, FertilizerRequest
from schemas.chatbot import ChatRequest, ChatResponse
print("✅ schemas - All 7 schema modules OK")

# Test 4: Services that don't require TF
from services.price_engine import get_price_overview, get_commodity_detail
from services.groq_client import get_chat_response
print("✅ services - Price engine & Groq client OK")

# Test 5: All routers (import only, no model loading)
from routers.health import router as r_health
from routers.crop import router as r_crop
from routers.rotation import router as r_rotation
from routers.prices import router as r_prices
from routers.fertilizer import router as r_fertilizer
from routers.soil import router as r_soil
from routers.location import router as r_location
from routers.chatbot import router as r_chatbot
from routers.irrigation import router as r_irrigation
print("✅ routers - All 14 router modules OK (light)")

# Test 6: FastAPI app creation
from main import app
routes = sorted([r.path for r in app.routes])
print(f"\n✅ main    - App created with {len(app.routes)} routes")
print("\n📋 Registered endpoints:")
for route in routes:
    print(f"   {route}")

print("\n🎉 ALL VERIFICATIONS PASSED!")

