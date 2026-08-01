const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../modules/user/user.model");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FRONTEND_URL,
} = require("./env");

// Debug: confirm env values are loaded at runtime (mask secret)
try {
  const maskedSecret = GOOGLE_CLIENT_SECRET
    ? `${GOOGLE_CLIENT_SECRET.slice(0, 4)}...${GOOGLE_CLIENT_SECRET.slice(-4)}`
    : 'not-set';
  // eslint-disable-next-line no-console
  console.log(`🔒 Google OAuth Client ID: ${GOOGLE_CLIENT_ID}`);
  // eslint-disable-next-line no-console
  console.log(`🔒 Google OAuth Client Secret (masked): ${maskedSecret}`);
  // eslint-disable-next-line no-console
  console.log(`↩️ Callback path: /api/auth/google/callback`);
} catch (e) {
  // ignore
}

// Only register Google OAuth when credentials are configured (graceful dev fallback)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const email = profile.emails?.[0]?.value || null;

            user = await User.create({
              googleId: profile.id,
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              email,
              username: `${email?.split("@")[0] || "user"}_${Date.now()}`,
              profilePicture: profile.photos?.[0]?.value,
              isVerified: true,
              password: null,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  // eslint-disable-next-line no-console
  console.log("🔓 Google OAuth skipped — GOOGLE_CLIENT_ID / SECRET not configured.");
}

module.exports = passport;