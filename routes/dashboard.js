const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Middleware para asegurar que el usuario esté disponible
const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard gerente
router.get('/gerente', authenticate, authorize('gerente'), ensureUser, (req, res) => {
  res.render('dashboard/gerente', { user: req.user });
});

// Dashboard administrador
router.get('/administrador', authenticate, authorize('administrador'), ensureUser, (req, res) => {
  res.render('dashboard/administrador', { user: req.user });
});

// Dashboard técnico
router.get('/tecnico', authenticate, authorize('tecnico'), ensureUser, (req, res) => {
  res.render('dashboard/tecnico', { user: req.user });
});

// Dashboard usuario normal
router.get('/user', authenticate, ensureUser, (req, res) => {
  res.render('dashboard/user', { user: req.user });
});

// Ruta principal que redirige según rol
router.get('/', authenticate, ensureUser, (req, res) => {
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