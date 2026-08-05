const nurseryService = require('./nursery.service');

// ============================================================
// MARKETPLACE / PUBLIC
// ============================================================

// GET /api/nursery/home — home feed
exports.getHomeFeed = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const feed = await nurseryService.getHomeFeed({ lat, lng, userId: req.user?.uid });
    res.json(feed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/search — smart unified search
exports.executeSearch = async (req, res) => {
  try {
    const { query, lat, lng, distance, rating, delivery, pickup, openNow, organic, categories, inStock } = req.query;
    const filters = { distance, rating, delivery, pickup, openNow, organic, categories, inStock };
    const result = await nurseryService.executeSearch({ query, lat, lng, filters });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/smart-search — alias for smart search
exports.smartSearch = async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    const result = await nurseryService.smartSearch({ query, lat, lng });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/suggestions — live search suggestions
exports.searchSuggestions = async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    const suggestions = await nurseryService.getSearchSuggestions({ query, lat, lng });
    res.json(suggestions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/categories
exports.getCropCategories = async (req, res) => {
  try {
    const categories = await nurseryService.getCropCategories();
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/crops?category=&lat=&lng=
exports.getCropsByCategory = async (req, res) => {
  try {
    const { category, lat, lng } = req.query;
    const crops = await nurseryService.getCropsByCategory({ category, lat, lng });
    res.json(crops);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/crops/:id — crop details
exports.getCropDetails = async (req, res) => {
  try {
    const crop = await nurseryService.getCropDetails(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/map — map markers
exports.getMapData = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const data = await nurseryService.getMapData({ lat, lng });
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/reviews/:id
exports.getReviews = async (req, res) => {
  try {
    const reviews = await nurseryService.getReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/plants/search — legacy plant search
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
// FARMER
// ============================================================

// POST /api/nursery/orders — create order
exports.createOrder = async (req, res) => {
  try {
    const { nursery_id, items, fulfillment_type, payment_method, address } = req.body;

    if (!nursery_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'nursery_id and items (array) are required' });
    }

    const order = await nurseryService.createOrder({
      farmerId: req.user.uid,
      nurseryId: nursery_id,
      items,
      fulfillmentType: fulfillment_type || 'pickup',
      paymentMethod: payment_method || 'cod',
      address: address || '',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/orders — farmer's orders or nursery's incoming
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

// POST /api/nursery/reviews — add review
exports.addReview = async (req, res) => {
  try {
    const { nursery_id, rating, comment } = req.body;
    const review = await nurseryService.addReview({
      userId: req.user.uid,
      userName: req.user.name || req.user.email || 'Farmer',
      nurseryId: nursery_id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/nursery/wishlist — toggle wishlist
exports.toggleWishlist = async (req, res) => {
  try {
    const { type, item_id } = req.body;
    const result = await nurseryService.toggleWishlist({ userId: req.user.uid, type, itemId: item_id });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const result = await nurseryService.getWishlist({ userId: req.user.uid, lat, lng });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/recommendations — AI recommendations
exports.getAIRecommendations = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await nurseryService.getAIRecommendations(req.user.uid, { limit });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/nursery/chat — get or create chat
exports.getOrCreateChat = async (req, res) => {
  try {
    const { nursery_id } = req.body;
    const result = await nurseryService.getOrCreateChat({ farmerId: req.user.uid, nurseryId: nursery_id });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/nursery/chat/:id/message — send message
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await nurseryService.sendMessage({
      chatId: req.params.id,
      senderId: req.user.uid,
      text,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// NURSERY OWNER
// ============================================================

// POST /api/nursery/register
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

// GET /api/nursery/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery profile not found. Please register first.' });
    res.json(profile);
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

// PUT /api/nursery/profile/extended — rich profile fields
exports.updateNurseryProfile = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    const updated = await nurseryService.updateNurseryProfile(profile.id, req.body);
    res.json({ message: 'Profile updated', nursery: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/plants — nursery's own inventory
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

// POST /api/nursery/plants — add simple plant
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

// POST /api/nursery/crops — add full crop
exports.addCrop = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found. Please register first.' });

    const crop = await nurseryService.addCrop({ ...req.body, nurseryId: profile.id });
    res.status(201).json(crop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/nursery/plants/:id
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

// DELETE /api/nursery/plants/:id
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

// PUT /api/nursery/orders/:id — update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const profile = await nurseryService.getProfileByUserId(req.user.uid);
    if (!profile) return res.status(404).json({ message: 'Nursery not found' });

    const { status } = req.body;
    const validStatuses = ['accepted', 'completed', 'cancelled', 'rejected', 'dispatched'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await nurseryService.updateOrderStatus(req.params.id, profile.id, status);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/dashboard-summary
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

// GET /api/nursery/detail/:id — public nursery detail
exports.getNurseryDetail = async (req, res) => {
  try {
    const nursery = await nurseryService.getNurseryDetail(req.params.id);
    if (!nursery) return res.status(404).json({ message: 'Nursery not found' });
    res.json(nursery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// ADMIN
// ============================================================

// GET /api/nursery/admin/nurseries
exports.getAllNurseries = async (req, res) => {
  try {
    const nurseries = await nurseryService.getAllNurseries();
    res.json(nurseries);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/nursery/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await nurseryService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/nursery/admin/nurseries/:id/status
exports.updateNurseryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const nursery = await nurseryService.updateNurseryStatus(req.params.id, status);
    res.json(nursery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// SEED (dev/demo)
// ============================================================

// POST /api/nursery/seed
exports.seedDatabase = async (req, res) => {
  try {
    const { seedDatabase } = require('./seedData');
    const result = await seedDatabase();
    res.json({ message: 'Database seeded successfully', ...result });
  } catch (error) {
    console.error('Seed failed:', error);
    res.status(500).json({ message: error.message || 'Seeding failed' });
  }
};
