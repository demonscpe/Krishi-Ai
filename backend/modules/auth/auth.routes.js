const express = require("express");
const router = express.Router();
const passport = require("../../config/passport");

const authController = require("./auth.controller");
const {
  validateSignup,
  validateSignin,
} = require("./auth.validation");

// Email/password
router.post("/signup", validateSignup, authController.signup);
router.post("/signin", validateSignin, authController.signin);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleSuccess
);

module.exports = router;