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




// Catch-all para cualquier ruta interna SPA y redirigir al dashboard principal según el rol
router.get('/:role/:section', authenticate, ensureUser, (req, res) => {
  const { role } = req.params;

  switch(role) {
    case 'gerente':
      return res.redirect('/dashboard/gerente');
    case 'administracion':
      return res.redirect('/dashboard/administracion');
    case 'tecnico':
      return res.redirect('/dashboard/tecnico');
    case 'user':
      return res.redirect('/dashboard/user');
    default:
      return res.redirect('/dashboard');
  }
});


module.exports = router;