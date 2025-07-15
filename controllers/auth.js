// controller/auth.js
const { matchedData } = require("express-validator");
const { encrypt, compare } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
const { usersModel } = require("../models");
const ENGINE_DB = process.env.ENGINE_DB;

/**
 * Registro de usuario
 */
const registerCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const password = await encrypt(req.password);
    const body = { ...req, password };
    const dataUser = await usersModel.create(body);
    
    const userData = ENGINE_DB === "nosql" 
      ? dataUser.toObject() 
      : dataUser.get({ plain: true });
    delete userData.password;

    const data = {
      token: await tokenSign(userData),
      user: userData,
    };
    
    // Redirección basada en rol después del registro
    return redirectByRole(res, data.token, userData.role);
    
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
};

/**
 * Login de usuario
 */
const loginCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    let user;
    
    if (ENGINE_DB === "nosql") {
      user = await usersModel.findOne({ username: req.username }).select('+password');
      if (user) user = user.toObject();
    } else {
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
    const token = await tokenSign(user);
    
    // Redirección basada en rol
    return redirectByRole(res, token, user.role);
    
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
};

/**
 * Función helper para redirección por rol
 */
const redirectByRole = (res, token, role) => {
  // Guardar el token en una cookie segura
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  });
  
  // Redireccionar según el rol
  switch(role) {
    case 'gerente':
      return res.redirect('/dashboard/gerente');
    case 'administrador':
      return res.redirect('/dashboard/administrador');
    case 'tecnico':
      return res.redirect('/dashboard/tecnico');
    default:
      return res.redirect('/dashboard/user');
  }
};

module.exports = { registerCtrl, loginCtrl };