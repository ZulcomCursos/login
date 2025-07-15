// routes/authViews.js
const express = require('express');
const router = express.Router();
const { loginCtrl, registerCtrl } = require('../controllers/auth');
const { validatorLogin, validatorRegister } = require('../validators/auth');

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

module.exports = router;