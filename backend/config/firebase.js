const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Uses environment variables for credentials (no service-account.json file needed)
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "krishi-ai-2c085",
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Only initialize if we have the required credentials
if (serviceAccount.client_email && serviceAccount.private_key) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  console.log("✅ Firebase Admin SDK initialized");
} else {
  // Fallback: initialize with just project ID (relies on ADC if available)
  admin.initializeApp({
    projectId: "krishi-ai-2c085",
  });
  console.log("⚠️ Firebase Admin initialized without service account (ADC mode)");
}

module.exports = admin;

