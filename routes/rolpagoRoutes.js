const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/mysql');
const { generarPDF, crearRolPago } = require('../controllers/rolpagoController');

// Obtener colaboradores para selects
router.get('/colaboradores', async (req, res) => {
  try {
    const [usuarios] = await sequelize.query(`
      SELECT 
        id AS id_trabajador, 
        nombres, 
        apellidos, 
        role AS cargo
      FROM users
      ORDER BY nombres ASC
    `);
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener colaboradores:', error);
    res.status(500).json({ mensaje: 'Error al obtener colaboradores' });
  }
});

router.get('/listar', async (req, res) => {
  try {
    const { mes, colaborador } = req.query;

    let query = `
      SELECT 
        r.*, 
        u.nombres, 
        u.apellidos, 
        u.role AS cargo
      FROM roles_pago r
      JOIN users u ON r.id_trabajador = u.id
    `;
    const conditions = [];
    const replacements = [];

    if (mes) {
      conditions.push("r.periodo = ?");
      replacements.push(mes);
    }

    if (colaborador) {
      conditions.push("r.id_trabajador = ?");
      replacements.push(colaborador);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [roles] = await sequelize.query(query, { replacements });

    res.json(roles);
  } catch (error) {
    console.error('Error al listar roles de pago:', error);
    res.status(500).json({ mensaje: 'Error al listar roles de pago' });
  }
});

// Crear rol de pago (POST)
router.post('/crear', crearRolPago);

// Generar PDF
router.get('/pdf/:id_trabajador', generarPDF);

router.get('/crear', async (req, res) => {
  try {
    const [colaboradores] = await sequelize.query(`
      SELECT 
        id AS id_trabajador, 
        nombres, 
        apellidos, 
        role AS cargo
      FROM users
      ORDER BY nombres ASC
    `);

    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      // petición AJAX: enviar solo parcial
      res.render('rolespago/gestion_roles_pago_parcial', { colaboradores });
    } else {
      // petición normal: enviar dashboard completo con parcial embebido
      res.render('dashboard/gerente', {
        user: req.user,
        colaboradores,
        section: 'rolespago/gestion_roles_pago_parcial'
      });
    }
  } catch (error) {
    console.error('Error al cargar vista parcial crear rol:', error);
    res.status(500).send('Error al cargar vista parcial crear rol');
  }
});


module.exports = router;
