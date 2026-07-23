const express = require('express');
const router = express.Router();
const nurseryController = require('./nursery.controller');
const verifyToken = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// --- Public / Search routes ---
// GET /api/nursery/plants/search?query=&lat=&lng= — search plants (anyone)
router.get('/plants/search', nurseryController.searchPlants);

// GET /api/nursery/detail/:id — public nursery detail
router.get('/detail/:id', nurseryController.getNurseryDetail);

// --- Farmer routes ---
// POST /api/nursery/orders — create order
router.post('/orders', verifyToken, roleMiddleware(['farmer']), nurseryController.createOrder);

// GET /api/nursery/orders — farmer's order history
router.get('/orders', verifyToken, nurseryController.getOrders);

// --- Nursery owner routes ---
// POST /api/nursery/register — register nursery profile
router.post('/register', verifyToken, roleMiddleware(['nursery']), nurseryController.registerNursery);

// GET /api/nursery/profile
router.get('/profile', verifyToken, roleMiddleware(['nursery']), nurseryController.getProfile);

// PUT /api/nursery/profile
router.put('/profile', verifyToken, roleMiddleware(['nursery']), nurseryController.updateProfile);

// CRUD plants (nursery owner)
router.get('/plants', verifyToken, roleMiddleware(['nursery']), nurseryController.getMyPlants);
router.post('/plants', verifyToken, roleMiddleware(['nursery']), nurseryController.addPlant);
router.put('/plants/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.updatePlant);
router.delete('/plants/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.deletePlant);

// Order management (nursery)
router.put('/orders/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.updateOrderStatus);

// Dashboard
router.get('/dashboard-summary', verifyToken, roleMiddleware(['nursery']), nurseryController.getDashboardSummary);

module.exports = router;

