const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { verRolesPagoVistaTecnico, listarRolesTecnico } = require('../controllers/verRolPagosController');

// Ruta para enviar el parcial con la vista para técnico (sin layout)
router.get('/ver', authenticate, verRolesPagoVistaTecnico);

// Ruta API para devolver roles JSON filtrados por técnico
router.get('/roles', authenticate, listarRolesTecnico);

module.exports = router;
