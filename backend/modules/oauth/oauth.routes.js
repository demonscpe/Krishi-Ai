const express = require("express");
const { googleAuth, googleCallback } = require("./oauth.controller");

const router = express.Router();

// Step 1: Redirect to Google
router.get("/google", googleAuth);

// Step 2: Callback
router.get("/google/callback", googleCallback);

module.exports = router;