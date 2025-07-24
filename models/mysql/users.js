const { sequelize } = require("../../config/mysql");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    domicilio: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Gerente", "Administracion", "Tecnico", "User"),
      defaultValue: 'User',
    },
    copia_cedula: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    record_policial: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion' // Mapea a tu columna en la base de datos
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_actualizacion' // Mapea a tu columna en la base de datos
    }
  },
  {
    timestamps: true, // Habilita timestamps
    createdAt: 'fecha_creacion', // Mapea createdAt a fecha_creacion
    updatedAt: 'fecha_actualizacion', // Mapea updatedAt a fecha_actualizacion
    tableName: 'users', // Asegura que use el nombre correcto de la tabla
    freezeTableName: true // Previene que Sequelize pluralice el nombre de la tabla
  }
);

// Métodos personalizados
User.find = User.findAll;
User.findById = User.findByPk;

module.exports = User;