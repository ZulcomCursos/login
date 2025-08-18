const express = require('express');
const router = express.Router();
const tecnicoController = require('../controllers/tecnicoController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Middleware para asegurar que el usuario esté disponible
const ensureUser = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Listar tickets asignados
router.get('/', authenticate, authorize(['Tecnico']), ensureUser, tecnicoController.index);

// Mostrar formulario para resolver ticket
router.get('/:id/resolver', authenticate, authorize(['Tecnico']), ensureUser, tecnicoController.resolverForm);

// Guardar solución del ticket
router.post('/:id/resolver', authenticate, authorize(['Tecnico']), ensureUser, tecnicoController.resolverTicket);

// Generar PDF
router.get('/:id/pdf', authenticate, authorize(['Tecnico']), ensureUser, tecnicoController.generarPDF);

// Ver información detallada
router.get('/:id/ver', authenticate, authorize(['Tecnico']), ensureUser, tecnicoController.verInformacion);



module.exports = router;
