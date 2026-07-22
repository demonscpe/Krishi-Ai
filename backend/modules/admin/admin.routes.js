const express = require("express");
const router = express.Router();

const adminController = require("./admin.controller");
const verifyToken = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

//
// 🔐 Protect all admin routes
//
router.use(verifyToken);
router.use(roleMiddleware(["admin"]));

//
// 👑 Admin Routes
//

// GET /api/admin/users?page=1&limit=10
router.get("/users", adminController.listUsers);

// PUT /api/admin/users/:id/role
router.put("/users/:id/role", adminController.changeRole);

// DELETE /api/admin/users/:id
router.delete("/users/:id", adminController.removeUser);

module.exports = router;