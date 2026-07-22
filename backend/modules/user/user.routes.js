const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const verifyToken = require("../../middleware/auth.middleware");

router.use(verifyToken);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.delete("/account", userController.deleteAccount);

module.exports = router;
