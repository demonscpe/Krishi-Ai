const nurseryService = require('./nursery.service');

// ============================================================
// POST /api/nursery/register — Register a nursery
// ============================================================
exports.registerNursery = async (req, res) => {
  try {
    const {
      nursery_name, owner_name, phone, email,
      latitude, longitude, address,
      opening_time, closing_time, license_number,
    } = req.body;

    const nursery = await nurseryService.registerNursery({
      userId: req.user.uid,
      nurseryName: nursery_name,
      ownerName: owner_name,
      phone,
      email,
      latitude,
      longitude,
      address,
      openingTime: opening_time,
      closingTime: closing_time,
      licenseNumber: license_number,
    });

    res.status(201).json({ message: 'Nursery registered successfully', nursery });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/profile
// ============================================================
exports.getProfile = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) {
      return res.status(404).json({ message: 'Nursery profile not found. Please register first.' });
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// PUT /api/nursery/profile
// ============================================================
exports.updateProfile = async (req, res) => {
  try {
    const {
      nursery_name, owner_name, phone, email,
      latitude, longitude, address,
      opening_time, closing_time, license_number,
    } = req.body;

    const data = {};
    if (nursery_name !== undefined) data.nurseryName = nursery_name;
    if (owner_name !== undefined) data.ownerName = owner_name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (latitude !== undefined) data.latitude = parseFloat(latitude);
    if (longitude !== undefined) data.longitude = parseFloat(longitude);
    if (address !== undefined) data.address = address;
    if (opening_time !== undefined) data.openingTime = opening_time;
    if (closing_time !== undefined) data.closingTime = closing_time;
    if (license_number !== undefined) data.licenseNumber = license_number;

    const updated = await nurseryService.updateProfile(req.user.uid, data);
    res.json({ message: 'Profile updated', nursery: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/plants/search?query=&lat=&lng=
// ============================================================
exports.searchPlants = async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    const plants = await nurseryService.searchPlants({ query, lat, lng });
    res.json(plants);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/plants — nursery's own plants (inventory)
// ============================================================
exports.getMyPlants = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found. Please register first.' });

    const plants = await nurseryService.getNurseryPlants(profile.id);
    res.json(plants);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// POST /api/nursery/plants — add a plant
// ============================================================
exports.addPlant = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found. Please register first.' });

    const { plant_name, category, price, quantity, image_url, description } = req.body;
    const plant = await nurseryService.addPlant({
      nurseryId: profile.id,
      plantName: plant_name,
      category,
      price,
      quantity,
      imageUrl: image_url,
      description,
    });

    res.status(201).json(plant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// PUT /api/nursery/plants/:id
// ============================================================
exports.updatePlant = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    const { plant_name, category, price, quantity, image_url, description } = req.body;
    const data = {};
    if (plant_name !== undefined) data.plantName = plant_name;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = parseFloat(price);
    if (quantity !== undefined) data.quantity = parseInt(quantity, 10);
    if (image_url !== undefined) data.imageUrl = image_url;
    if (description !== undefined) data.description = description;

    const updated = await nurseryService.updatePlant(req.params.id, profile.id, data);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// DELETE /api/nursery/plants/:id
// ============================================================
exports.deletePlant = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    await nurseryService.deletePlant(req.params.id, profile.id);
    res.json({ message: 'Plant deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// POST /api/nursery/orders — create order (farmer)
// ============================================================
exports.createOrder = async (req, res) => {
  try {
    const { nursery_id, items, fulfillment_type } = req.body;

    if (!nursery_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'nursery_id and items (array) are required' });
    }

    const order = await nurseryService.createOrder({
      farmerId: req.user.uid,
      nurseryId: nursery_id,
      items,
      fulfillmentType: fulfillment_type || 'pickup',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/orders — farmer's orders or nursery's incoming orders
// ============================================================
exports.getOrders = async (req, res) => {
  try {
    const { role } = req.user;
    let orders;

    if (role === 'farmer') {
      orders = await nurseryService.getFarmerOrders(req.user.uid);
    } else if (role === 'nursery') {
      const profile = await nurseryService.getProfileByUserId(req.user.uid);
      if (!profile) return res.status(404).json({ message: 'Nursery not found' });
      orders = await nurseryService.getNurseryOrders(profile.id);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// PUT /api/nursery/orders/:id — update order status (nursery)
// ============================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    const { status } = req.body;
    const validStatuses = ['accepted', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await nurseryService.updateOrderStatus(req.params.id, profile.id, status);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/dashboard-summary
// ============================================================
exports.getDashboardSummary = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    const summary = await nurseryService.getDashboardSummary(profile.id);
    res.json(summary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// GET /api/nursery/detail/:id — public nursery detail for farmers
// ============================================================
exports.getNurseryDetail = async (req, res) => {
  try {
    const nursery = await nurseryService.getNurseryDetail(req.params.id);
    if (!nursery) return res.status(404).json({ message: 'Nursery not found' });

    res.json(nursery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

