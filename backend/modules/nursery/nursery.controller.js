const nurseryService = require('./nursery.service');
const { pool } = require('../../config/postgres');

// POST /api/nursery/register — Register a nursery
exports.registerNursery = async (req, res) => {
  try {
    const {
      nursery_name, owner_name, phone, email,
      latitude, longitude, address,
      opening_time, closing_time, license_number
    } = req.body;

    const result = await pool.query(
      `INSERT INTO nurseries (user_id, nursery_name, owner_name, phone, email, latitude, longitude, address, opening_time, closing_time, license_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
       RETURNING *`,
      [req.user.id, nursery_name, owner_name, phone, email, latitude, longitude, address, opening_time, closing_time, license_number]
    );

    res.status(201).json({ message: 'Nursery registered successfully', nursery: result.rows[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM nurseries WHERE user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/nursery/profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      nursery_name, owner_name, phone, email,
      latitude, longitude, address,
      opening_time, closing_time, license_number
    } = req.body;

    const result = await pool.query(
      `UPDATE nurseries SET 
        nursery_name = COALESCE($1, nursery_name),
        owner_name = COALESCE($2, owner_name),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        latitude = COALESCE($5, latitude),
        longitude = COALESCE($6, longitude),
        address = COALESCE($7, address),
        opening_time = COALESCE($8, opening_time),
        closing_time = COALESCE($9, closing_time),
        license_number = COALESCE($10, license_number)
      WHERE user_id = $11
      RETURNING *`,
      [nursery_name, owner_name, phone, email, latitude, longitude, address, opening_time, closing_time, license_number, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nursery profile not found' });
    }
    res.json({ message: 'Profile updated', nursery: result.rows[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/plants/search?query=&lat=&lng=
exports.searchPlants = async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    const plants = await nurseryService.searchPlants({ query, lat, lng });
    res.json(plants);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/plants — nursery's own plants
exports.getMyPlants = async (req, res) => {
  try {
    // Get nursery id from user_id
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const result = await pool.query(
      `SELECT * FROM plants WHERE nursery_id = $1 ORDER BY created_at DESC`,
      [nurseryRes.rows[0].id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/nursery/plants — add a plant
exports.addPlant = async (req, res) => {
  try {
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const { plant_name, category, price, quantity, image_url, description } = req.body;
    const result = await pool.query(
      `INSERT INTO plants (nursery_id, plant_name, category, price, quantity, image_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nurseryRes.rows[0].id, plant_name, category, price, quantity, image_url, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/nursery/plants/:id
exports.updatePlant = async (req, res) => {
  try {
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const { plant_name, category, price, quantity, image_url, description } = req.body;
    const result = await pool.query(
      `UPDATE plants SET
        plant_name = COALESCE($1, plant_name),
        category = COALESCE($2, category),
        price = COALESCE($3, price),
        quantity = COALESCE($4, quantity),
        image_url = COALESCE($5, image_url),
        description = COALESCE($6, description)
      WHERE id = $7 AND nursery_id = $8
      RETURNING *`,
      [plant_name, category, price, quantity, image_url, description, req.params.id, nurseryRes.rows[0].id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Plant not found or not yours' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/nursery/plants/:id
exports.deletePlant = async (req, res) => {
  try {
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const result = await pool.query(
      `DELETE FROM plants WHERE id = $1 AND nursery_id = $2 RETURNING *`,
      [req.params.id, nurseryRes.rows[0].id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plant not found or not yours' });
    res.json({ message: 'Plant deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/nursery/orders — create order (farmer)
exports.createOrder = async (req, res) => {
  try {
    const { nursery_id, items, fulfillment_type } = req.body;
    const order = await nurseryService.createOrder({
      farmer_id: req.user.id,
      nursery_id,
      items,
      fulfillment_type,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/orders — farmer's orders or nursery's incoming orders
exports.getOrders = async (req, res) => {
  try {
    const { role } = req.user;
    let orders;

    if (role === 'farmer') {
      orders = await nurseryService.getFarmerOrders(req.user.id);
    } else if (role === 'nursery') {
      const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
      if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });
      orders = await nurseryService.getNurseryOrders(nurseryRes.rows[0].id);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/nursery/orders/:id — update order status (nursery)
exports.updateOrderStatus = async (req, res) => {
  try {
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const { status } = req.body;
    const validStatuses = ['accepted', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await nurseryService.updateOrderStatus(req.params.id, nurseryRes.rows[0].id, status);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/dashboard-summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const nurseryRes = await pool.query(`SELECT id FROM nurseries WHERE user_id = $1`, [req.user.id]);
    if (nurseryRes.rows.length === 0) return res.status(404).json({ message: 'Nursery not found' });

    const summary = await nurseryService.getDashboardSummary(nurseryRes.rows[0].id);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/detail/:id — public nursery detail for farmers
exports.getNurseryDetail = async (req, res) => {
  try {
    const nursery = await nurseryService.getNurseryDetail(req.params.id);
    if (!nursery) return res.status(404).json({ message: 'Nursery not found' });

    const plants = await nurseryService.getNurseryPlants(req.params.id);
    res.json({ ...nursery, plants });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

