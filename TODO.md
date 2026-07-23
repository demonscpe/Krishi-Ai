# Task: Fix .gitignore + Replace "agrotech" → "krishi" + Remove Render references

## Steps to Complete

### Phase 1: Fix .gitignore & .gitattributes
- [x] Step 1: Fix root `Krishii-AI/.gitignore` — remove duplicates, add missing patterns
- [x] Step 2: Create `Krishii-AI/.gitattributes` — fix CRLF line ending warnings
- [x] Step 3: Fix `api/.gitignore` — remove wrong venv paths
- [x] Step 4: Fix `disease-prediction-api/.gitignore` — remove hardcoded venv paths

### Phase 2: Rebrand "agrotech" → "krishi" in file contents
- [x] Step 5: Update `api/app.py` — premade requests + system prompt (AgroTech AI → Krishi AI, agro-tech-ai.vercel.app → krishi-ai.vercel.app)
- [x] Step 6: Update `krishi-ai-chatbot/src/main.py` — already uses Krishi-Ai naming
- [ ] Step 7: Rename folders (`agrotech-ai-apis/`, `agrotech-ai-chatbot/`, `agrotech-api's/`) — **WARNING: Will break imports if not done carefully**

### Phase 3: Backend Firebase Auth Integration
- [x] Step 8: Create `backend/config/firebase.js` — Firebase Admin SDK init
- [x] Step 9: Update `backend/middleware/auth.middleware.js` — Firebase token verification
- [x] Step 10: Update `backend/config/env.js` — graceful env var fallback + Firebase vars
- [x] Step 11: Add `firebase-admin` to `backend/package.json` + npm install

### Phase 4: Git apply
- [ ] Step 12: Run `git add`, commit, and push all changes

