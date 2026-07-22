"""
Krishi-AI Unified FastAPI Application
======================================
Consolidates all Flask API services into a single FastAPI app with:
- Pydantic validation on all endpoints
- Auto-generated Swagger docs at /docs
- Async ML inference where possible
- Centralized model loading via lifespan
- Unified error handling
"""
import sys
from pathlib import Path

# Ensure the project root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import CORS_ORIGINS, HOST, PORT


def create_app() -> FastAPI:
    """Application factory."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup: models are loaded lazily on first use
        print("🚀 Krishi-AI FastAPI starting up...")
        yield
        # Shutdown: clear model cache
        from services.ml_models import clear_models
        clear_models()
        print("👋 Krishi-AI FastAPI shutting down...")

    app = FastAPI(
        title="Krishi-AI Unified API",
        description="Consolidated API for all Krishi-AI services: crop prediction, disease detection, "
                    "price forecasting, crop rotation, fertilizer recommendation, soil analysis, "
                    "seed quality, mushroom edibility, chatbot, irrigation, and location-based services.",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ---- CORS ----
    origins = [origin.strip() for origin in CORS_ORIGINS.split(",")] if CORS_ORIGINS != "*" else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- Global Exception Handler ----
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": str(exc), "detail": "An internal error occurred."},
        )

    # ---- Register Routers (Consolidated) ----
    # Crop recommendation consolidated module (preferred - replaces /api/crop/ and /api/rotation/)
    from croprecommendation.router import router as croprecommendation_router
    
    # Other API modules
    from routers.health import router as health_router
    from routers.disease import router as disease_router
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

    # ---- Disease Intelligence Platform modules ----
    from plant_identification.router import router as plant_identification_router
    from disease_severity.router import router as disease_severity_router
    from treatment_recommendation.router import router as treatment_recommendation_router
    from disease_prevention.router import router as disease_prevention_router
    from disease_chatbot.router import router as disease_chatbot_router
    from disease_report.router import router as disease_report_router
    from disease_history.router import router as disease_history_router
    from disease_detection_new.router import router as disease_detection_new_router

    # ---- New dedicated feature modules ----
    from croprotation.router import router as croprotation_router
    from priceprediction.router import router as priceprediction_router
    from cropidentification.router import router as cropidentification_router
    from croprotationplan.router import router as croprotationplan_router
    from soil.router import router as soil_analysis_router
    
    # ---- Soil Intelligence Platform modules ----
    from soil_image_analysis.router import router as soil_image_analysis_router
    from soil_test_input.router import router as soil_test_input_router
    from soil_health_analyzer.router import router as soil_health_analyzer_router
    from fertilizer_recommendation.router import router as fertilizer_recommendation_router

    # Consolidated crop recommendation endpoints:
    #   POST /api/croprecommendation/predict   — Predict best crop from soil params
    #   POST /api/croprecommendation/recommend  — Rotation recommendation
    #   GET  /api/croprecommendation/accuracy   — Model accuracy metrics
    app.include_router(croprecommendation_router)
    app.include_router(croprotation_router)       # POST /api/croprotation/recommend
    app.include_router(priceprediction_router)    # GET  /api/priceprediction/overview, POST /detail
    app.include_router(cropidentification_router) # POST /api/cropidentification/identify
    app.include_router(croprotationplan_router)   # POST /api/croprotationplan/generate
    app.include_router(soil_analysis_router)      # POST /api/soil/analyze
    app.include_router(soil_image_analysis_router)  # POST /api/soil-image-analysis
    app.include_router(soil_test_input_router)       # POST /api/soil-test, POST /api/soil-test/ocr
    app.include_router(soil_health_analyzer_router)  # POST /api/soil-health
    app.include_router(fertilizer_recommendation_router)  # POST /api/fertilizer-recommendation
    
    # Disease Intelligence Platform routers
    app.include_router(plant_identification_router)  # POST /api/plant-identification
    app.include_router(disease_severity_router)      # POST /api/disease-severity
    app.include_router(treatment_recommendation_router)  # POST /api/treatment-recommendation
    app.include_router(disease_prevention_router)        # POST /api/disease-prevention
    app.include_router(disease_chatbot_router)           # POST /api/disease-chatbot
    app.include_router(disease_report_router)           # GET /api/disease-report/pdf
    app.include_router(disease_history_router)          # GET /api/disease-history
    app.include_router(disease_detection_new_router)    # POST /api/disease-detection
    
    # Existing routers (kept for backward compatibility; will be removed in v3.0)
    from routers.crop import router as crop_router
    from routers.rotation import router as rotation_router
    app.include_router(health_router)
    app.include_router(crop_router)      # DEPRECATED — use /api/croprecommendation/predict instead
    app.include_router(disease_router)
    app.include_router(rotation_router)  # DEPRECATED — use /api/croprecommendation/recommend instead
    app.include_router(prices_router)
    app.include_router(fertilizer_router)
    app.include_router(soil_router)
    app.include_router(seed_router)
    app.include_router(location_router)
    app.include_router(chatbot_router)
    app.include_router(paddy_router)
    app.include_router(sugarcane_router)
    app.include_router(mushroom_router)
    app.include_router(irrigation_router)

    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

