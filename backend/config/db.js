const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('./env');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // Fail fast when Postgres is unreachable so the server can start without DB.
  dialectOptions: {
    connectionTimeoutMillis: 5000,
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 5000,
  },
});

const connectDB = async () => {
  // No DATABASE_URL configured -> skip DB entirely (graceful dev fallback)
  if (!DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not set — running without Postgres.');
    return;
  }

  await sequelize.authenticate();
  console.log('✅ Postgres connected');

  // sync models in dev (safe default: alter: false)
  await sequelize.sync({ alter: false });
};

module.exports = { connectDB, sequelize };
