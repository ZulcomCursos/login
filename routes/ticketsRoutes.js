const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const methodOverride = require('method-override');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Middleware para soportar PUT y DELETE desde formularios HTML con _method
router.use(methodOverride('_method'));

// Middleware para asegurar que el usuario esté disponible
const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Listar todos los tickets (usuarios autenticados)
router.get('/', authenticate, ensureUser, ticketsController.index);

// Mostrar formulario para crear un nuevo ticket (usuarios autenticados)
router.get('/create', authenticate, ensureUser, ticketsController.create);

// Ruta AJAX para buscar cliente por cédula (usuarios autenticados)
router.get('/search-client', authenticate, ensureUser, ticketsController.searchClient);

// Guardar nuevo ticket (usuarios autenticados)
router.post('/', authenticate, ensureUser, ticketsController.store);

// Mostrar detalles de un ticket (usuarios autenticados)
router.get('/:id', authenticate, ensureUser, ticketsController.show);

// Mostrar formulario para editar ticket (solo Gerente y Administración)
router.get('/:id/edit', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, ticketsController.edit);

// Actualizar ticket completo (solo Gerente y Administración)
router.put('/:id', authenticate, authorize(['Gerente', 'Administracion']), ensureUser, ticketsController.update);

// Eliminar ticket (solo Gerente)
router.delete('/:id', authenticate, authorize(['Gerente']), ensureUser, ticketsController.destroy);

// Actualizar solo el estado del ticket (usuarios autenticados, puede ser vía formulario o AJAX)
router.post('/:id/status', authenticate, ensureUser, ticketsController.updateStatus);

module.exports = router;
