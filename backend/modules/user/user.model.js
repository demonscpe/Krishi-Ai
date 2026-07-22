const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: true },
  googleId: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'customer' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING },
  verificationTokenExpires: { type: DataTypes.DATE },
  resetPasswordOTP: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE },
  phone: { type: DataTypes.STRING },
  profilePicture: { type: DataTypes.STRING, defaultValue: 'https://via.placeholder.com/150' },
  address: { type: DataTypes.STRING },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  loyaltyTier: { type: DataTypes.STRING, defaultValue: 'bronze' },
  referralCode: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

User.beforeCreate(async (user, options) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user, options) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.comparePassword = async function(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = User;
