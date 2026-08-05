const express = require('express');
const router = express.Router();
const nurseryController = require('./nursery.controller');
const verifyToken = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

// ============================================================
// PUBLIC ROUTES (browsing / searching — no auth required)
// ============================================================
router.get('/search', nurseryController.executeSearch);
router.get('/suggestions', nurseryController.searchSuggestions);
router.get('/smart-search', nurseryController.smartSearch);
router.get('/home', nurseryController.getHomeFeed);
router.get('/categories', nurseryController.getCropCategories);
router.get('/crops', nurseryController.getCropsByCategory);
router.get('/crops/:id', nurseryController.getCropDetails);
router.get('/map', nurseryController.getMapData);
router.get('/reviews/:id', nurseryController.getReviews);
router.get('/detail/:id', nurseryController.getNurseryDetail);
router.get('/plants/search', nurseryController.searchPlants);

// ============================================================
// SEED ROUTE (populate demo data — dev/demo)
// ============================================================
router.post('/seed', nurseryController.seedDatabase);

// ============================================================
// FARMER ROUTES (authenticated)
// ============================================================
router.post('/orders', verifyToken, roleMiddleware(['farmer']), nurseryController.createOrder);
router.get('/orders', verifyToken, nurseryController.getOrders);
router.post('/reviews', verifyToken, roleMiddleware(['farmer']), nurseryController.addReview);
router.post('/wishlist', verifyToken, nurseryController.toggleWishlist);
router.get('/wishlist', verifyToken, nurseryController.getWishlist);
router.get('/recommendations', verifyToken, roleMiddleware(['farmer']), nurseryController.getAIRecommendations);
router.post('/chat', verifyToken, nurseryController.getOrCreateChat);
router.post('/chat/:id/message', verifyToken, nurseryController.sendMessage);

// ============================================================
// NURSERY OWNER ROUTES
// ============================================================
router.post('/register', verifyToken, roleMiddleware(['nursery']), nurseryController.registerNursery);
router.get('/profile', verifyToken, roleMiddleware(['nursery']), nurseryController.getProfile);
router.put('/profile', verifyToken, roleMiddleware(['nursery']), nurseryController.updateProfile);
router.put('/profile/extended', verifyToken, roleMiddleware(['nursery']), nurseryController.updateNurseryProfile);
router.get('/plants', verifyToken, roleMiddleware(['nursery']), nurseryController.getMyPlants);
router.post('/plants', verifyToken, roleMiddleware(['nursery']), nurseryController.addPlant);
router.post('/crops', verifyToken, roleMiddleware(['nursery']), nurseryController.addCrop);
router.put('/plants/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.updatePlant);
router.delete('/plants/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.deletePlant);
router.put('/orders/:id', verifyToken, roleMiddleware(['nursery']), nurseryController.updateOrderStatus);
router.get('/dashboard-summary', verifyToken, roleMiddleware(['nursery']), nurseryController.getDashboardSummary);

// ============================================================
// ADMIN ROUTES
// ============================================================
router.get('/admin/nurseries', verifyToken, roleMiddleware(['admin']), nurseryController.getAllNurseries);
router.get('/admin/orders', verifyToken, roleMiddleware(['admin']), nurseryController.getAllOrders);
router.put('/admin/nurseries/:id/status', verifyToken, roleMiddleware(['admin']), nurseryController.updateNurseryStatus);

module.exports = router;
