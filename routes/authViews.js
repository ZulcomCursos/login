const express = require('express');
const router = express.Router();
const { loginCtrl, registerCtrl, showChangePassword, changePassword } = require('../controllers/auth');
const { validatorLogin, validatorRegister } = require('../validators/auth');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../utils/handleStorage'); 
const fs = require('fs');
const path = require('path');

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

  // Mostrar formulario de registro
  router.get('/register', (req, res) => { //, authenticate, authorize(['Gerente','Administracion']), ensureUser
    res.render('auth/register', { 
      title: 'Registro',
      errors: [], // Inicializa como array vacío en lugar de null/undefined
      formData: {},
      user: req.user 
    });
  });

  // Procesar registro
  router.post(
    '/register',
    upload.fields([
      { name: 'copia_cedula', maxCount: 1 },
      { name: 'record_policial', maxCount: 1 }
    ]),
    validatorRegister,
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

  module.exports = router;