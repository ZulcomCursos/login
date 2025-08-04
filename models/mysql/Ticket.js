const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/mysql.js');
const Client = require('./Cliente.js');
const User = require('./users.js');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  ticketNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'numero_ticket'
  },
  issueType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'tipo_problema'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  status: {
    type: DataTypes.ENUM('abierto', 'cerrado', 'completado'),
    defaultValue: 'abierto',
    field: 'estado'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id_cliente'
    },
    field: 'id_cliente'
  },
  tecnicoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    field: 'id_tecnico'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_actualizacion'
  },
  solutionDate: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'fecha_solucion'
  },
  solutionTime: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'hora_solucion'
  },
 solution: {
  type: DataTypes.TEXT,
  allowNull: true,
  field: 'solucion'
},
  horaVisita: {
  type: DataTypes.TIME,
  allowNull: true,
  field: 'horaVisita'
},
priority: {
  type: DataTypes.ENUM('Alta', 'Media', 'Baja'),
  defaultValue: 'Media',
  field: 'prioridad'
}

}, {
  tableName: 'tickets',
  timestamps: false
});

// Relaciones: usa el nombre exacto del atributo Sequelize en foreignKey
Ticket.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Client.hasMany(Ticket, { foreignKey: 'clientId' });

Ticket.belongsTo(User, { as: 'tecnico', foreignKey: 'tecnicoId' });
User.hasMany(Ticket, { foreignKey: 'tecnicoId' });

module.exports = Ticket;
