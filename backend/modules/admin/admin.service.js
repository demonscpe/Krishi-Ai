const User = require("../user/user.model");
const { Op } = require('sequelize');

exports.getAllUsers = async (page, limit) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  const total = await User.count();
  return { users, total, page, pages: Math.ceil(total / limit) };
};

exports.updateUserRole = async (adminId, userId, role) => {
  if (adminId === userId) throw new Error("Cannot change your own role");
  const validRoles = ["admin", "farmer", "vendor", "customer"];
  if (!validRoles.includes(role)) throw new Error("Invalid role");

  const [updatedRows, [updatedUser]] = await User.update({ role }, {
    where: { id: userId },
    returning: true,
  });

  if (!updatedRows) throw new Error('User not found');

  return updatedUser;
};

exports.deleteUser = async (adminId, userId) => {
  if (adminId === userId) throw new Error("Cannot delete your own account");
  const deletedRows = await User.destroy({ where: { id: userId } });
  return deletedRows > 0;
};
