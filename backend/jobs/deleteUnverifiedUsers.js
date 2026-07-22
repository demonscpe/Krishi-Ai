const cron = require("node-cron");
const User = require("../modules/user/user.model");
const logger = require("../utils/logger");

const deleteUnverifiedUsers = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deletedRows = await User.destroy({
      where: {
        isVerified: false,
        createdAt: { [User.sequelize.Op.lt]: cutoff },
      },
    });

    if (deletedRows > 0) {
      logger.info("Deleted unverified users", {
        count: deletedRows,
      });
    }
  } catch (error) {
    logger.error("Cleanup job failed", { error: error.message });
  }
};

let isJobRunning = false;

const initCleanupJob = () => {
  if (isJobRunning) return;

  cron.schedule(
    "0 0 * * *", // daily midnight
    deleteUnverifiedUsers,
    {
      timezone: "Asia/Kolkata",
    }
  );

  isJobRunning = true;

  logger.info("Cleanup job initialized");
};

module.exports = initCleanupJob;