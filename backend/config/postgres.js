const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const connectPostgres = async () => {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
};

module.exports = { pool, connectPostgres };
