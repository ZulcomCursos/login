// routes/dashboard.js
const express = require('express');
const router = express.Router();
const  authenticate  = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');


// Dashboard gerente - solo accesible para gerentes
router.get('/gerente', authenticate, authorize('gerente'), (req, res) => {
  res.render('dashboard/gerente', { user: req.user });
});

// Dashboard administrador - solo accesible para administradores
router.get('/administrador', authenticate, authorize('administrador'), (req, res) => {
  res.render('dashboard/administrador', { user: req.user });
});

// Dashboard técnico - solo accesible para técnicos
router.get('/tecnico', authenticate, authorize('tecnico'), (req, res) => {
  res.render('dashboard/tecnico', { user: req.user });
});

// Dashboard usuario normal
router.get('/user', authenticate, (req, res) => {
  res.render('dashboard/user', { user: req.user });
});

// Ruta para dashboard principal que redirige según rol
router.get('/', authenticate, (req, res) => {
  switch(req.user.role) {
    case 'gerente':
      return res.redirect('/dashboard/gerente');
    case 'administrador':
      return res.redirect('/dashboard/administrador');
    case 'tecnico':
      return res.redirect('/dashboard/tecnico');
    default:
      return res.redirect('/dashboard/user');
  }
});

module.exports = router;