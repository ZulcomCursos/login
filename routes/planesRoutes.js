const express = require('express');
const router = express.Router();
const planesController = require('../controllers/planesController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Middleware para asegurar que el usuario esté disponible
const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Listar planes (disponible para todos los usuarios autenticados)
router.get('/', authenticate, ensureUser, planesController.list);

// Formulario para crear plan (solo Gerente y Administración)
router.get('/create', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, planesController.createForm);

// Crear plan (solo Gerente y Administración)
router.post('/', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, planesController.create);

// Formulario para editar plan (solo Gerente y Administración)
router.get('/:id/edit', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, planesController.editForm);

// Actualizar plan (solo Gerente y Administración)
router.post('/:id', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, planesController.update);

// Eliminar plan (solo Gerente)
router.get('/:id/delete', authenticate, authorize(['Gerente']), ensureUser, planesController.delete);

module.exports = router;
