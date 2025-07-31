const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/mysql');
const Plan = require('./Plan');

const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: DataTypes.STRING,
  apellido: DataTypes.STRING,
  nombre: DataTypes.STRING,
  cedula: DataTypes.STRING,
  correo: DataTypes.STRING,
  telefono1: DataTypes.STRING,
  telefono2: DataTypes.STRING,
  direccion: DataTypes.TEXT,
  coordenadas: DataTypes.STRING,
  parroquia: DataTypes.STRING,
  canton: DataTypes.STRING,
  ciudad: DataTypes.STRING,
  provincia: DataTypes.STRING,
  discapacidad: DataTypes.STRING,
  referencias: DataTypes.TEXT,
  id_plan: DataTypes.INTEGER,
  fecha_contrato: DataTypes.DATE,
  estado: DataTypes.STRING
}, {
  tableName: 'clientes',
  timestamps: false
});
Cliente.belongsTo(Plan, {
  foreignKey: 'id_plan',
  as: 'Plan'
});

module.exports = Cliente;
