const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('./env');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Postgres connected');

    // sync models in dev (safe default: alter: false)
    await sequelize.sync({ alter: false });
  } catch (error) {
    console.error(`❌ Database Error: ${error.message || error}`);
    if (error && error.stack) {
      console.error(error.stack);
    } else {
      console.error(error);
    }
    console.error(`DATABASE_URL present: ${Boolean(DATABASE_URL)}`);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
