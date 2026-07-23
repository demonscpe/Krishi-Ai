const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const oauthRoutes = require("./modules/oauth/oauth.routes");
const rentRoutes = require("./modules/rent/rent.routes");
const shopRoutes = require("./modules/shop/product.routes");
const cropRoutes = require("./modules/crop/crop.routes");
const nurseryRoutes = require("./modules/nursery/nursery.routes");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/rent", rentRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/nursery", nurseryRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Krishi-Ai Backend Running");
});

// Global error handler (MUST be last)
app.use(errorMiddleware);

module.exports = app;