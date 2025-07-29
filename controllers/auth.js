const { matchedData } = require("express-validator");
const { encrypt, compare } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
const { usersModel } = require("../models");
const generateUsername = require("../utils/handleUsername");
const fs = require('fs');
const path = require('path');
const ENGINE_DB = process.env.ENGINE_DB;

/**
 * Controlador para registrar un nuevo usuario
 */
const registerCtrl = async (req, res) => {
  try {
    // Verificar que se subieron los archivos
    if (!req.files || !req.files['copia_cedula'] || !req.files['record_policial']) {
      return res.render('auth/register', {
        title: 'Registro',
        errors: ['Debe subir ambos documentos (copia de cédula y record policial)'],
        formData: req.body
      });
    }

    const reqData = matchedData(req);
    
    // Generar username automático
    const username = generateUsername(reqData.nombres, reqData.apellidos);
    
    // Asignar cédula como contraseña
    const password = await encrypt(reqData.cedula);
    
    // Obtener nombres de archivos
    const copiaCedula = req.files['copia_cedula'][0].filename;
    const recordPolicial = req.files['record_policial'][0].filename;
    
    const userData = { 
      ...reqData, 
      password,
      username,
      copia_cedula: copiaCedula,
      record_policial: recordPolicial
    };
    
    const dataUser = await usersModel.create(userData);
    const user = dataUser.get({ plain: true });
    delete user.password;

    const data = {
      token: await tokenSign(user),
      user: user,
    };
    
    return redirectByRole(res, data.token, user.role);
    
  } catch (e) {
    console.error('Error en registerCtrl:', e);
    
    // Eliminar archivos si hubo error
    if (req.files) {
      if (req.files['copia_cedula']) {
        fs.unlinkSync(path.join(__dirname, '../storage/cedula', req.files['copia_cedula'][0].filename));
      }
      if (req.files['record_policial']) {
        fs.unlinkSync(path.join(__dirname, '../storage/record', req.files['record_policial'][0].filename));
      }
    }

    // Manejar errores de validación de Sequelize
    let errorMessages = ['Error al registrar el usuario. Por favor, intente nuevamente.'];
    
    if (e.name === 'SequelizeUniqueConstraintError') {
      errorMessages = e.errors.map(err => {
        if (err.path === 'cedula') return 'La cédula ya está registrada';
        if (err.path === 'telefono') return 'El teléfono ya está registrado';
        if (err.path === 'email') return 'El email ya está registrado';
        if (err.path === 'username') return 'El nombre de usuario ya existe';
        return err.message;
      });
    }

    return res.render('auth/register', {
      title: 'Registro',
      errors: errorMessages,
      formData: req.body
    });
  }
};

/**
 * Controlador para el login de usuarios
 */
const loginCtrl = async (req, res) => {
  try {
    const reqData = matchedData(req);
    let user;
    
    if (ENGINE_DB === "nosql") {
      user = await usersModel.findOne({ username: reqData.username }).select('+password');
      if (user) user = user.toObject();
    } else {
      user = await usersModel.findOne({ 
        where: { username: reqData.username }
      });
      if (user) user = user.get({ plain: true });
    }

    if (!user) {
      return res.render('auth/login', { 
        title: 'Iniciar Sesión',
        errors: ['Credenciales incorrectas'],
        formData: reqData
      });
    }

    const check = await compare(reqData.password, user.password);
    if (!check) {
      return res.render('auth/login', { 
        title: 'Iniciar Sesión',
        errors: ['Credenciales incorrectas'],
        formData: reqData
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
    case 'Gerente':
      return res.redirect('/dashboard/gerente');
    case 'Administracion':
      return res.redirect('/dashboard/administracion');
    case 'Tecnico':
      return res.redirect('/dashboard/tecnico');
    default:
      return res.redirect('/dashboard/user');
  }
};

/**
 * Controlador para mostrar el formulario de cambio de contraseña
 */
const showChangePassword = async (req, res) => {
  try {
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
    console.error('Error en showChangePassword:', e);
    handleHttpError(res, "ERROR_SHOW_CHANGE_PASSWORD");
  }
};

/**
 * Controlador para procesar el cambio de contraseña
 */
const changePassword = async (req, res) => {
  try {
    const { newPassword, repeatPassword, telefono, email, domicilio } = req.body;
    const userId = req.user.id;

    // Validaciones
    const errors = [];
    
    if (newPassword !== repeatPassword) {
      errors.push("Las contraseñas nuevas no coinciden");
    }
    
    if (newPassword.length < 3 || newPassword.length > 15) {
      errors.push("La nueva contraseña debe tener entre 3 y 15 caracteres");
    }

    if (errors.length > 0) {
      const userData = await usersModel.findByPk(userId);
      return res.render('auth/change_password', {
        title: 'Cambiar Contraseña',
        user: userData.get({ plain: true }),
        errors
      });
    }

    // Actualizar datos
    const encryptedPassword = await encrypt(newPassword);
    
    await usersModel.update({
      password: encryptedPassword,
      telefono,
      email,
      domicilio
    }, { 
      where: { id: userId } 
    });

    return redirectByRole(res, req.cookies.jwt, req.user.role);
    
  } catch(e) {
    console.error('Error en changePassword:', e);
    handleHttpError(res, "ERROR_CHANGING_PASSWORD");
  }
};

module.exports = { 
  registerCtrl, 
  loginCtrl,
  showChangePassword,
  changePassword,
  redirectByRole
};