const passport = require("passport");
const { FRONTEND_URL } = require("../../config/env");
const { generateAccessToken } = require("../auth/auth.utils");

// Start Google login
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google callback (JWT flow)
exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user) => {
      if (err || !user) {
        return res.redirect(`${FRONTEND_URL}/login`);
      }

      // 🔥 Generate JWT
      const token = generateAccessToken(user);

      // Redirect to frontend with token
      return res.redirect(
        `${FRONTEND_URL}/auth/success?token=${token}`
      );
    }
  )(req, res, next);
};