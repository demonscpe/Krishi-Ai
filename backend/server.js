const app = require("./app");
const { connectDB } = require("./config/db");
const initCleanupJob = require("./jobs/deleteUnverifiedUsers");
const { PORT } = require("./config/env");

const start = async () => {
  await connectDB();
  initCleanupJob();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();
