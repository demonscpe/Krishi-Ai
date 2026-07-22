"""Simple verification script to ensure all imports work."""
import sys
sys.path.insert(0, '.')

print("Testing imports...")

# Config
from config import BASE_DIR, MODEL_DIR, CROP_DATA_DIR, UPLOAD_DIR
print(f"  ✅ config.py - BASE_DIR: {BASE_DIR}")

# Utils
from utils.rate_limiter import rate_limiter
from utils.image_utils import load_image_bytes
print("  ✅ utils/ - OK")

# Schemas
from schemas.crop import CropPredictRequest, CropPredictResponse
from schemas.disease import DiseasePredictResponse
from schemas.rotation import RotationRequest
from schemas.prices import PriceOverviewResponse, CommodityRequest
from schemas.soil import SoilQualityRequest, LocationRequest, FertilizerRequest
from schemas.chatbot import ChatRequest
print("  ✅ schemas/ - OK")

# Services
from services.groq_client import get_chat_response
from services.ml_models import get_crop_recommendation_model
from services.price_engine import get_price_overview, get_commodity_detail
print("  ✅ services/ - OK (lazy-loaded)")

# Routers
from routers.health import router as health_router
from routers.crop import router as crop_router
from routers.disease import router as disease_router
from routers.rotation import router as rotation_router
from routers.prices import router as prices_router
from routers.fertilizer import router as fertilizer_router
from routers.soil import router as soil_router
from routers.seed import router as seed_router
from routers.location import router as location_router
from routers.chatbot import router as chatbot_router
from routers.paddy import router as paddy_router
from routers.sugarcane import router as sugarcane_router
from routers.mushroom import router as mushroom_router
from routers.irrigation import router as irrigation_router
print("  ✅ routers/ - OK")

# Main app
from main import app
# Verify routes
routes = [r.path for r in app.routes]
print(f"\n  ✅ main.py - App created with {len(app.routes)} routes")
print(f"\n  📋 Registered routes:")
for route in sorted(routes):
    print(f"     {route}")

print("\n✅ ALL IMPORTS SUCCESSFUL - Krishi-AI FastAPI is ready!")

