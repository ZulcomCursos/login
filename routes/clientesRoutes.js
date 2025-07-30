const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validatorCreateCliente, validatorUpdateCliente } = require('../validators/clientes');

// Middleware para asegurar que el usuario esté disponible
const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Listar clientes (disponible para todos los usuarios autenticados)
router.get('/', authenticate, ensureUser, clientesController.list);

// Formulario para crear cliente (solo Gerente y Administración)
router.get('/create', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, clientesController.createForm);

// Crear cliente (solo Gerente y Administración)
router.post('/', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, validatorCreateCliente,clientesController.create);

// Formulario para editar cliente (solo Gerente y Administración)
router.get('/:id/edit', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, clientesController.editForm);

// Actualizar cliente (solo Gerente y Administración)
router.post('/:id', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, validatorUpdateCliente, clientesController.update);

// Eliminar cliente (solo Gerente)
router.get('/:id/delete', authenticate, authorize(['Gerente']), ensureUser, clientesController.delete);

module.exports = router;
