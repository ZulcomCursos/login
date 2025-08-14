const express = require('express');
const router = express.Router();
const { loginCtrl, registerCtrl, showChangePassword, changePassword } = require('../controllers/auth');
const { validatorLogin,validatorRegisterStep1, validatorRegisterStep2,  } = require('../validators/auth');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../utils/handleStorage'); 
const fs = require('fs');
const path = require('path');
const {usersModel} = require ('../models')
  const ensureUser = (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    next();
  };

  // Mostrar formulario de login
  router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Iniciar Sesión', errors: null, formData: null });
  });

  // Procesar login
  router.post('/login', validatorLogin, loginCtrl);

// Mostrar formulario de registro paso 1
router.get('/register', authenticate, authorize(['Gerente','Administracion']), ensureUser, (req, res) => { 
  res.render('auth/register-step1', { 
    title: 'Registro - Paso 1',
    errors: [],
    formData: {},
    user: req.user 
  });
});

// Procesar registro paso 1
router.post('/register-step1', validatorRegisterStep1, (req, res, next) => {
  try {
    // Verificar que req.session está definido
    if (!req.session) {
      throw new Error('Sesión no inicializada');
    }
    
    // Guardar datos en sesión
    req.session.registerData = req.body;
    res.redirect('/auth/register-step2');
  } catch (error) {
    console.error('Error al guardar datos en sesión:', error);
    return res.render('auth/register-step1', {
      title: 'Registro - Paso 1',
      errors: ['Ocurrió un error al procesar el formulario. Intente nuevamente.'],
      formData: req.body
    });
  }
});

// Mostrar formulario de registro paso 2 (documentos)
router.get('/register-step2', authenticate, authorize(['Gerente','Administracion']), (req, res) => {
  try {
    // Verificar que req.session está definido y tiene datos
    if (!req.session || !req.session.registerData) {
      return res.redirect('/auth/register');
    }
    
    res.render('auth/register-step2', {
      title: 'Registro - Paso 2',
      errors: [],
      user: req.user
    });
  } catch (error) {
    console.error('Error al mostrar paso 2:', error);
    res.redirect('/auth/register');
  }
});
// Procesar registro completo
router.post(
  '/register-complete',
  upload.fields([
    { name: 'copia_cedula', maxCount: 1 },
    { name: 'record_policial', maxCount: 1 }
  ]),
  validatorRegisterStep2,
  registerCtrl
);

  // Descargar documentos
  router.get('/download/:type/:userId', authenticate, async (req, res) => {
    try {
      const { type, userId } = req.params;
      let user;
      
      if (process.env.ENGINE_DB === "nosql") {
        user = await usersModel.findById(userId);
      } else {
        user = await usersModel.findByPk(userId);
      }

      if (!user) {
        return res.status(404).send('Usuario no encontrado');
      }

      let filePath;
      if (type === 'cedula') {
        filePath = path.join(__dirname, '../storage/cedula', user.copia_cedula);
      } else if (type === 'record') {
        filePath = path.join(__dirname, '../storage/record', user.record_policial);
      } else {
        return res.status(400).send('Tipo de documento no válido');
      }

      if (fs.existsSync(filePath)) {
        return res.download(filePath);
      } else {
        return res.status(404).send('Archivo no encontrado');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al descargar el archivo');
    }
  });

  // Cerrar sesión
  router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/auth/login');
  });

  // Mostrar formulario para cambiar contraseña
  router.get('/change-password', authenticate, showChangePassword);

  // Procesar cambio de contraseña
  router.post('/change-password', authenticate, changePassword);

   router.get('/error', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/auth/error');
  });
  module.exports = router;