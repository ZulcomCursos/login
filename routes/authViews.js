// routes/authViews.js
const express = require('express');
const router = express.Router();
const { loginCtrl, registerCtrl, showChangePassword, changePassword } = require('../controllers/auth');
const { validatorLogin, validatorRegister } = require('../validators/auth');
const authenticate = require ('../middleware/authenticate')
const authorize = require('../middleware/authorize');

const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Mostrar formulario de login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Iniciar Sesión' });
});

// Procesar login
router.post('/login', validatorLogin, loginCtrl);

// Mostrar formulario de registro
router.get('/register', authenticate, authorize(['gerente','administrador']), ensureUser, (req, res) => {
  res.render('auth/register', { user: req.user });
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