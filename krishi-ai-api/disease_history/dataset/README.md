# Disease History Dataset

## Description
The disease history module serves demo data in-memory. In production,
this should be replaced with a database-backed solution.

## Data Model
- id: Unique detection record ID
- plant: Plant/crop type
- disease: Detected disease (or "Healthy")
- confidence: Detection confidence (0-100)
- severity: Disease severity level (Low/Medium/High)
- status: Healthy/Diseased
- date: Detection timestamp
- image_url: Optional path to uploaded image
- treatment: Recommended treatment summary
- prevention: Key prevention measures

## Database Schema (for production)
```sql
CREATE TABLE disease_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plant VARCHAR(100),
    disease VARCHAR(200),
    confidence FLOAT,
    severity VARCHAR(20),
    status VARCHAR(20),
    detected_at TIMESTAMP DEFAULT NOW(),
    image_url TEXT,
    treatment TEXT,
    prevention TEXT
);
```

## API
- GET /api/disease-history?limit=10&offset=0 — Paginated history
- GET /api/disease-history/stats — Summary statistics

