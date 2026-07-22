const express = require("express");
const router = express.Router();
const cropController = require("./crop.controller");
const verifyToken = require("../../middleware/auth.middleware");

router.use(verifyToken);

// POST /api/crop/save  — save a prediction result
router.post("/save", cropController.saveResult);

// GET /api/crop/history — get user's past predictions
router.get("/history", cropController.getHistory);

// DELETE /api/crop/history/:id
router.delete("/history/:id", cropController.deleteHistory);

module.exports = router;
