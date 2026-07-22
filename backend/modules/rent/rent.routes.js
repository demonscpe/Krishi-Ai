const express = require("express");
const router = express.Router();

const rentController = require("./rent.controller");
const verifyToken = require("../../middleware/auth.middleware");

// Public
router.get("/products", rentController.getProducts);

// Protected
router.post("/order", verifyToken, rentController.placeOrder);

module.exports = router;