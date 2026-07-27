const app = require("./app");
const { connectDB } = require("./config/db");
const { PORT } = require("./config/env");

const start = async () => {
  // Graceful DB connection - don't crash if Postgres is unavailable
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (dbError) {
    console.warn("⚠️ Database connection failed — running without database:", dbError.message);
    console.warn("⚠️ Auth, user, and admin routes requiring Postgres will return errors.");
    console.warn("⚠️ Firebase-based features (nursery, tasks) will still work.");
  }

  // Only init cleanup job if DB is functional (optional)
  try {
    const initCleanupJob = require("./jobs/deleteUnverifiedUsers");
    initCleanupJob();
  } catch (jobError) {
    // Cleanup job requires PostgreSQL — skip silently
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();
