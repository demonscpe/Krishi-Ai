const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  category: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING },
  variants: { type: DataTypes.JSONB },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = Product;
