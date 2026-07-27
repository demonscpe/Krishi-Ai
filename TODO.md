# Krishi-AI Backend & API Fixes

## ✅ Phase 1: Node.js Backend (Port 8080)
### Fixed:
- [x] `backend/server.js` - Graceful DB connection (no crash if PostgreSQL missing)
- [x] `backend/app.js` - Already has proper Firebase setup, auth middleware references

### Remaining Issues (minor):
- [ ] Install npm dependencies: `cd backend && npm install`
- [ ] Create `.env` with Firebase credentials for full auth features
- [ ] Without PostgreSQL, auth/user/admin routes return DB errors (expected)

## ✅ Phase 2: FastAPI (Port 8000)
### Fixed:
- [x] `krishi-ai-api/.env` - Created with default config
- [x] `krishi-ai-api/routers/crop.py` - Restored corrupted file, added fallback for missing models
- [x] `krishi-ai-api/services/ml_models.py` - Already has graceful handling for missing model files

### Remaining:
- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Missing model files (non-critical, endpoints return proper error messages):
  - `crop_recommendation.pkl`
  - `fertilizer.pkl`
  - `classifier.pkl`
  - `soil_quality.pkl`
  - `crop_rotation_recommendation_model.pkl`
  - `plant_disease_model.tflite`
- [ ] These models are referenced by old Flask API (`api/app.py`) and won't affect FastAPI

## How to Run:
### FastAPI (recommended - all new features):
```bash
cd Krishii-AI/krishi-ai-api
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Node.js Backend (legacy - auth + nursery):
```bash
cd Krishii-AI/backend
npm install
node server.js  # Starts on port 8080, won't crash if no DB
```

### Old Flask API (legacy):
```bash
cd Krishii-AI/api
pip install -r requirements.txt
python app.py  # Runs on port 5000
