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
router.get('/gerente', authenticate, authorize(['Gerente']), ensureUser, (req, res) => {
  res.render('dashboard/gerente', { 
    title: 'Dashboard Gerente',
    user: req.user 
  });
});

// Dashboard administrador
router.get('/administracion', authenticate, authorize(['Administracion']), ensureUser, (req, res) => {
  res.render('dashboard/administracion', { 
    title: 'Dashboard Administración',
    user: req.user 
  });
});

// Dashboard técnico
router.get('/tecnico', authenticate, authorize(['Tecnico']), ensureUser, (req, res) => {
  res.render('dashboard/tecnico', { 
    title: 'Dashboard Técnico',
    user: req.user 
  });
});

// Dashboard usuario normal
router.get('/user', authenticate, ensureUser, (req, res) => {
  res.render('dashboard/user', { 
    title: 'Dashboard Usuario',
    user: req.user 
  });
});

// Ruta principal que redirige según rol
router.get('/', authenticate, ensureUser, (req, res) => {
  switch(req.user.role) {
    case 'Gerente':
      return res.redirect('/dashboard/gerente');
    case 'Administracion':
      return res.redirect('/dashboard/administracion');
    case 'Tecnico':
      return res.redirect('/dashboard/tecnico');
    default:
      return res.redirect('/dashboard/user');
  }
});

module.exports = router;