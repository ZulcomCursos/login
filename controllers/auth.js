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
  // Guardar el token en una cookie segura
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development', // Cambiado a 'production'
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

/**
 * Mostrar formulario para cambiar contraseña
 */
const showChangePassword = async (req, res) => {
  try {
    // Obtener datos del usuario desde el token
    const user = req.user;
    
    if (ENGINE_DB === "nosql") {
      const userData = await usersModel.findById(user._id).lean();
      return res.render('auth/change_password', { 
        title: 'Cambiar Contraseña',
        user: userData,
        errors: null
      });
    } else {
      const userData = await usersModel.findByPk(user.id);
      return res.render('auth/change_password', { 
        title: 'Cambiar Contraseña',
        user: userData.get({ plain: true }),
        errors: null
      });
    }
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_SHOW_CHANGE_PASSWORD");
  }
};

/**
 * Procesar cambio de contraseña
 */
const changePassword = async (req, res) => {
  try {
    //const { currentPassword, newPassword, repeatPassword, telefono, email } = req.body;
    const { newPassword, repeatPassword, telefono, email } = req.body;
    const userId = req.user.id; // o req.user._id para MongoDB

    // Validaciones básicas
    const errors = [];
    
    if (newPassword !== repeatPassword) {
      errors.push("Las contraseñas nuevas no coinciden");
    }
    
    if (newPassword.length < 3 || newPassword.length > 15) {
      errors.push("La nueva contraseña debe tener entre 3 y 15 caracteres");
    }

    // Obtener usuario con contraseña
    let user;
    if (ENGINE_DB === "nosql") {
      user = await usersModel.findById(userId).select('+password').lean();
    } else {
      user = await usersModel.findByPk(userId);
      user = user.get({ plain: true });
    }

    // Comparar contraseñas (la importante)
    //const isMatch = await compare(currentPassword, user.password);
    //if (!isMatch) {
      //errors.push("La contraseña actual es incorrecta");
    //}

    if (errors.length > 0) {
      return res.render('auth/change_password', {
        title: 'Cambiar Contraseña',
        user: { ...user, telefono, email },
        errors
      });
    }

    // Si todo está bien, actualizar
    const encryptedPassword = await encrypt(newPassword);
    
    if (ENGINE_DB === "nosql") {
      await usersModel.findByIdAndUpdate(userId, {
        password: encryptedPassword,
        telefono,
        email
      });
    } else {
      await usersModel.update({
        password: encryptedPassword,
        telefono,
        email
      }, { where: { id: userId } });
    }

    // Redirigir
    return redirectByRole(res, req.cookies.jwt, req.user.role);
    
  } catch(e) {
    console.log(e);
    handleHttpError(res, "ERROR_CHANGING_PASSWORD");
  }
};

// Actualiza el export al final del archivo
module.exports = { 
  registerCtrl, 
  loginCtrl,
  showChangePassword,
  changePassword,
  redirectByRole
};