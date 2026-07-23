const { Op } = require('sequelize');
const { sequelize } = require('../../config/db');
const { pool } = require('../../config/postgres');

// Helper: Haversine distance in KM
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Search plants across nearby nurseries
exports.searchPlants = async ({ query, lat, lng }) => {
  const searchPattern = query ? `%${query}%` : '%';

  const result = await pool.query(
    `
    SELECT 
      p.id AS plant_id,
      p.plant_name,
      p.category,
      p.price,
      p.quantity,
      p.description,
      p.image_url,
      n.id AS nursery_id,
      n.nursery_name,
      n.owner_name,
      n.phone,
      n.email,
      n.address,
      n.latitude,
      n.longitude,
      n.opening_time,
      n.closing_time,
      n.status
    FROM plants p
    JOIN nurseries n ON n.id = p.nursery_id
    WHERE n.status = 'active'
      AND p.quantity > 0
      AND (p.plant_name ILIKE $1 OR p.category ILIKE $1)
    ORDER BY n.nursery_name ASC
    `,
    [searchPattern]
  );

  let rows = result.rows;

  // Compute distance if lat/lng provided
  if (lat && lng) {
    rows = rows.map((row) => ({
      ...row,
      distance_km: haversine(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(row.latitude),
        parseFloat(row.longitude)
      ),
    }));
    rows.sort((a, b) => a.distance_km - b.distance_km);
  } else {
    rows = rows.map((row) => ({ ...row, distance_km: null }));
  }

  return rows;
};

// Get single nursery detail
exports.getNurseryDetail = async (nurseryId) => {
  const result = await pool.query(
    `SELECT * FROM nurseries WHERE id = $1`,
    [nurseryId]
  );
  return result.rows[0] || null;
};

// Get plants for a specific nursery
exports.getNurseryPlants = async (nurseryId) => {
  const result = await pool.query(
    `SELECT * FROM plants WHERE nursery_id = $1 AND quantity > 0 ORDER BY plant_name ASC`,
    [nurseryId]
  );
  return result.rows;
};

// Create an order (transactional)
exports.createOrder = async ({ farmer_id, nursery_id, items, fulfillment_type }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let total = 0;

    // Validate and calculate total
    for (const item of items) {
      const plantRes = await client.query(
        `SELECT id, price, quantity FROM plants WHERE id = $1 AND nursery_id = $2 FOR UPDATE`,
        [item.plant_id, nursery_id]
      );

      if (plantRes.rows.length === 0) {
        throw new Error(`Plant ${item.plant_id} not found in this nursery`);
      }

      const plant = plantRes.rows[0];
      if (plant.quantity < item.quantity) {
        throw new Error(`Insufficient stock for plant ${item.plant_id}. Available: ${plant.quantity}`);
      }

      total += parseFloat(plant.price) * item.quantity;
    }

    // Create order
    const orderRes = await client.query(
      `INSERT INTO orders (farmer_id, nursery_id, total, status, fulfillment_type)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING *`,
      [farmer_id, nursery_id, total, fulfillment_type || 'pickup']
    );

    const order = orderRes.rows[0];

    // Create order items & decrement stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, plant_id, price, quantity)
         VALUES ($1, $2, (SELECT price FROM plants WHERE id = $2), $3)`,
        [order.id, item.plant_id, item.quantity]
      );

      await client.query(
        `UPDATE plants SET quantity = quantity - $1 WHERE id = $2`,
        [item.quantity, item.plant_id]
      );
    }

    await client.query('COMMIT');

    // Fetch the full order with items
    const fullOrder = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'plant_id', oi.plant_id,
        'plant_name', p.plant_name,
        'price', oi.price,
        'quantity', oi.quantity
      )) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN plants p ON p.id = oi.plant_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [order.id]
    );

    return fullOrder.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get farmer's orders
exports.getFarmerOrders = async (farmerId) => {
  const result = await pool.query(
    `SELECT o.*, n.nursery_name,
      json_agg(json_build_object(
        'plant_id', oi.plant_id,
        'plant_name', p.plant_name,
        'price', oi.price,
        'quantity', oi.quantity
      )) AS items
    FROM orders o
    JOIN nurseries n ON n.id = o.nursery_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN plants p ON p.id = oi.plant_id
    WHERE o.farmer_id = $1
    GROUP BY o.id, n.nursery_name
    ORDER BY o.created_at DESC`,
    [farmerId]
  );
  return result.rows;
};

// Get nursery's incoming orders
exports.getNurseryOrders = async (nurseryId) => {
  const result = await pool.query(
    `SELECT o.*, u.name AS farmer_name, u.email AS farmer_email,
      json_agg(json_build_object(
        'plant_id', oi.plant_id,
        'plant_name', p.plant_name,
        'price', oi.price,
        'quantity', oi.quantity
      )) AS items
    FROM orders o
    JOIN users u ON u.id = o.farmer_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN plants p ON p.id = oi.plant_id
    WHERE o.nursery_id = $1
    GROUP BY o.id, u.name, u.email
    ORDER BY o.created_at DESC`,
    [nurseryId]
  );
  return result.rows;
};

// Update order status
exports.updateOrderStatus = async (orderId, nurseryId, status) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND nursery_id = $2 FOR UPDATE`,
      [orderId, nurseryId]
    );

    if (orderRes.rows.length === 0) {
      throw new Error('Order not found or not associated with this nursery');
    }

    const order = orderRes.rows[0];

    // If rejected/cancelled, restore stock
    if ((status === 'cancelled' || status === 'rejected') && order.status === 'pending') {
      const itemsRes = await client.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [orderId]
      );

      for (const item of itemsRes.rows) {
        await client.query(
          `UPDATE plants SET quantity = quantity + $1 WHERE id = $2`,
          [item.quantity, item.plant_id]
        );
      }
    }

    const updateRes = await client.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, orderId]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get nursery dashboard summary
exports.getDashboardSummary = async (nurseryId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ordersResult, plantsResult, todayOrders] = await Promise.all([
    pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) AS revenue_total
      FROM orders WHERE nursery_id = $1`,
      [nurseryId]
    ),
    pool.query(
      `SELECT COUNT(*) AS count FROM plants WHERE nursery_id = $1`,
      [nurseryId]
    ),
    pool.query(
      `SELECT COUNT(*) AS count FROM orders WHERE nursery_id = $1 AND created_at >= $2`,
      [nurseryId, today]
    ),
  ]);

  return {
    todays_orders_count: parseInt(todayOrders.rows[0].count),
    pending_count: parseInt(ordersResult.rows[0].pending_count),
    completed_count: parseInt(ordersResult.rows[0].completed_count),
    plants_available_count: parseInt(plantsResult.rows[0].count),
    revenue_total: parseFloat(ordersResult.rows[0].revenue_total),
  };
};

