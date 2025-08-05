const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate'); // tu middleware JWT
const {  verRolesPagoVista,  listarMisRoles } = require('../controllers/verRolPagosController');

router.get('/ver', authenticate, verRolesPagoVista);
router.get('/data', authenticate, listarMisRoles);

module.exports = router;