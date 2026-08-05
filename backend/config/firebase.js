const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase Admin SDK
// Priority:
//   1. Service account JSON file in config/service-account.json
//   2. Environment variables (FIREBASE_*)
//   3. Application Default Credentials (ADC)
const serviceAccountPath = path.join(__dirname, "service-account.json");

try {
  if (fs.existsSync(serviceAccountPath)) {
    // Load credentials from the service-account.json file
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin SDK initialized (service-account.json)");
  } else {
    // Fallback: use environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "krishi-ai-2c085",
      private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (serviceAccount.client_email && serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log("✅ Firebase Admin SDK initialized (env vars)");
    } else {
      // Last resort: ADC mode
      admin.initializeApp({
        projectId: "krishi-ai-2c085",
      });
      console.log("⚠️ Firebase Admin initialized without service account (ADC mode)");
    }
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  // Initialize in ADC mode as a last resort so the server can still boot
  admin.initializeApp({ projectId: "krishi-ai-2c085" });
  console.log("⚠️ Firebase Admin initialized in fallback ADC mode");
}

module.exports = admin;
