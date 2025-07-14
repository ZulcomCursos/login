const { matchedData } = require("express-validator");
const { encrypt, compare } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
const { usersModel } = require("../models");
const ENGINE_DB = process.env.ENGINE_DB;

/**
 * Este controlador es el encargado de registrar un usuario
 * @param {*} req 
 * @param {*} res 
 */
const registerCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const password = await encrypt(req.password);
    const body = { ...req, password };
    const dataUser = await usersModel.create(body);
    
    // Para ambos motores, eliminamos el password de la respuesta
    const userData = ENGINE_DB === "nosql" 
      ? dataUser.toObject() 
      : dataUser.get({ plain: true });
      delete userData.password;

    const data = {
      token: await tokenSign(userData),
      user: userData,
    };
    res.status(201).send({ data });
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
};

/**
 * Este controlador es el encargado de logear a una persona
 * @param {*} req 
 * @param {*} res 
 */
const loginCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    let user;
    if (ENGINE_DB === "nosql") {
      // Sintaxis para MongoDB (Mongoose)
      user = await usersModel.findOne({ username: req.username }).select('+password');
      if (user) user = user.toObject();
    } else {
      // Sintaxis para MySQL (Sequelize)
      user = await usersModel.findOne({ 
        where: { username: req.username },
        raw: true
      });
    }

    if (!user) {
      handleHttpError(res, "USER_NOT_EXISTS", 404);
      return;
    }

    const check = await compare(req.password, user.password);
    if (!check) {
      handleHttpError(res, "PASSWORD_INVALID", 401);
      return;
    }

    delete user.password;
    const data = {
      token: await tokenSign(user),
      user
    };

    res.send({ data });
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
};

module.exports = { registerCtrl, loginCtrl };