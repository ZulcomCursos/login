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
    
    // Verificar si el usuario ya existe
    const existingUser = await usersModel.findOne({
      where: ENGINE_DB === "nosql" ? { username: req.username } : { username: req.username }
    });
    
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Registro',
        errors: ['El nombre de usuario ya está en uso'],
        formData: req
      });
    }

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
    
    return redirectByRole(res, data.token, userData.role);
    
  } catch(e) {
    console.error('Error en registerCtrl:', e);
    return res.render('auth/register', {
      title: 'Registro',
      errors: ['Error al registrar el usuario. Por favor, intente nuevamente.'],
      formData: req.body
    });
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
      return res.render('auth/login', { 
        title: 'Iniciar Sesión',
        errors: ['Credenciales incorrectas'],
        formData: req
      });
    }

    const check = await compare(req.password, user.password);
    if (!check) {
      return res.render('auth/login', { 
        title: 'Iniciar Sesión',
        errors: ['Credenciales incorrectas'],
        formData: req
      });
    }

    delete user.password;
    const token = await tokenSign(user);
    
    return redirectByRole(res, token, user.role);
    
  } catch(e) {
    console.error('Error en loginCtrl:', e);
    return res.render('auth/login', { 
      title: 'Iniciar Sesión',
      errors: ['Error al iniciar sesión. Por favor, intente nuevamente.'],
      formData: req.body
    });
  }
};

/**
 * Función helper para redirección por rol
 */
const redirectByRole = (res, token, role) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  });
  
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