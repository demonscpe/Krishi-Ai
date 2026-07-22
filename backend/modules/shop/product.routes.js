const express = require("express");
const router = express.Router();

const productController = require("./product.controller");

//
// Public routes
//

// GET /api/shop/products
router.get("/products", productController.listProducts);

// GET /api/shop/products/search?q=tractor
router.get("/products/search", productController.searchProducts);

// GET /api/shop/products/:id
router.get("/products/:id", productController.getProduct);

module.exports = router;