// models/Plan.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/mysql');

const Plan = sequelize.define('Plan', {
  id_plan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_plan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  megas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'planes',
  timestamps: false,
});

module.exports = Plan;
