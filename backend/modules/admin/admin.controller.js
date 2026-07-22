const adminService = require("./admin.service");

//
// Get all users
//
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const data = await adminService.getAllUsers(
      Number(page),
      Number(limit)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//
// Change user role
//
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!role) {
      return res.status(400).json({
        message: "Role is required",
      });
    }

    const user = await adminService.updateUserRole(
      req.user.id,
      id,
      role
    );

    res.json({
      message: "Role updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//
// Delete user
//
exports.removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.deleteUser(req.user.id, id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};