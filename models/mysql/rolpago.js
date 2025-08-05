// models/rol_pago.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql.js');
const User = require('./users.js');

const RolPago = sequelize.define('RolPago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_trabajador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  horas_extra: DataTypes.FLOAT,
  decimos: DataTypes.FLOAT,
  bonos: DataTypes.FLOAT,
  descuentos: DataTypes.FLOAT,
  salario: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  aporte_iess: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'generado'
  }
}, {
  tableName: 'roles_pago',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Asociación (si usas relaciones)
RolPago.belongsTo(User, {
  foreignKey: 'id_trabajador',
  targetKey: 'id'
});

module.exports = RolPago;
