const User = require("./user.model");
const { Op } = require('sequelize');

//
// Get user profile
//
exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });
  return user;
};

//
// Update profile
//
exports.updateProfile = async (userId, data) => {
  // Prevent password updates here
  delete data.password;

  // Prevent duplicate email/username
  if (data.email || data.username) {
    const existing = await User.findOne({
      where: {
        [Op.or]: [
          { email: data.email },
          { username: data.username },
        ],
        id: { [Op.ne]: userId },
      },
    });

    if (existing) {
      throw new Error("Email or username already in use");
    }
  }

  const [updatedRows, [updatedUser]] = await User.update(data, {
    where: { id: userId },
    returning: true,
  });

  if (!updatedRows) {
    throw new Error('User not found');
  }

  return updatedUser;
};

//
// Check username availability
//
exports.isUsernameAvailable = async (username) => {
  const user = await User.findOne({ where: { username } });
  return !user;
};

//
// Delete account
//
exports.deleteUser = async (userId) => {
  const deletedRows = await User.destroy({ where: { id: userId } });
  return deletedRows > 0;
};