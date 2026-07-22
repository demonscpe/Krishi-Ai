const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const CropHistory = sequelize.define('CropHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  inputs: { type: DataTypes.JSONB },
  prediction: { type: DataTypes.STRING, allowNull: false },
  confidence: { type: DataTypes.FLOAT },
  alternatives: { type: DataTypes.JSONB },
  aiInsight: { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = CropHistory;
