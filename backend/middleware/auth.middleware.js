const admin = require("../config/firebase");

/**
 * Verify Firebase ID Token.
 * The frontend (api.js interceptor) sends Firebase Auth ID tokens.
 * This middleware verifies them using Firebase Admin SDK.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      role: decodedToken.role || "farmer", // custom claim fallback
      firebase: decodedToken,
    };
    next();
  } catch (error) {
    console.error("❌ Firebase token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
