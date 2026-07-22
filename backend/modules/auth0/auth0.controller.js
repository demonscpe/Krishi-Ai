const { pool } = require('../../config/postgres');

// The Auth0 middleware verifies the JWT before this handler runs. `sub` is
// Auth0's stable, provider-issued identity key for the account.
exports.syncProfile = async (req, res, next) => {
  try {
    const { sub } = req.auth.payload;
    const { rows } = await pool.query(
      `INSERT INTO users (auth0_sub)
       VALUES ($1)
       ON CONFLICT (auth0_sub)
       DO UPDATE SET updated_at = NOW()
       RETURNING id, auth0_sub, email, display_name, role, created_at, updated_at`,
      [sub]
    );

    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};
