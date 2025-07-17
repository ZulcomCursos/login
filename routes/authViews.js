// routes/authViews.js
const express = require('express');
const router = express.Router();
const { loginCtrl, registerCtrl, showChangePassword, changePassword } = require('../controllers/auth');
const { validatorLogin, validatorRegister } = require('../validators/auth');
const authenticate = require ('../middleware/authenticate')

// Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Iniciar Sesión' });
});

// Procesar login
router.post('/login', validatorLogin, loginCtrl);

// Mostrar formulario de registro
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Registro' });
});

// Procesar registro
router.post('/register', validatorRegister, registerCtrl);

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