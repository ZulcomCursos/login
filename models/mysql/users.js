const { sequelize } = require("../../config/mysql")
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM(["user", "tecnico", "administrador", "gerente"]),
      defaultValue:("user"),
    },
  },
  {
    timestamps: true,
  }
);
User.find = User.findAll;
User.findById = User.findByPk;
module.exports = User;
