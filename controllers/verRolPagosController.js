const { sequelize } = require('../config/mysql');
const { generarPDFColaborador } = require('../services/pdfGenerator');

// Middleware para proteger rutas usando JWT ya autenticado
function protegerRuta(req, res, next) {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  next();
}

async function verRolesPagoVista(req, res) {
  try {
    const usuario = req.user;

    const roles = await sequelize.query(
      `SELECT r.*, u.nombres, u.apellidos, u.role AS cargo
       FROM roles_pago r
       INNER JOIN users u ON r.id_trabajador = u.id
       WHERE r.id_trabajador = ?`,
      {
        replacements: [usuario.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const esAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (esAjax) {
      // Si es una solicitud AJAX, renderiza el parcial sin layout
      return res.render('ver_rolespago/ver_roles_pago_parcial', { usuario, roles, layout: false });
    } else {
      // Si es acceso directo (navegación normal), renderiza el dashboard completo (layout general)
      return res.render('dashboard/administracion', { 
        title: 'Dashboard Administración',
        user: usuario
      });
    }
  } catch (error) {
    console.error('Error al cargar roles de pago:', error);
    res.status(500).send('Error al cargar roles de pago');
  }
}


// API para devolver roles de pago del usuario logueado (JSON)
async function listarMisRoles(req, res) {
  try {
    const usuario = req.user;

    const roles = await sequelize.query(
      `SELECT r.*, u.nombres, u.apellidos, u.role AS cargo
       FROM roles_pago r
       INNER JOIN users u ON r.id_trabajador = u.id
       WHERE r.id_trabajador = ?`,
      {
        replacements: [usuario.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(roles);
  } catch (error) {
    console.error('Error al listar roles:', error);
    res.status(500).json({ error: 'Error al listar roles' });
  }
}

// Generar PDF para un rol específico
const generarPDFPorRol = async (req, res) => {
  try {
    const { id } = req.params;

    const roles = await sequelize.query(`
      SELECT r.*, u.nombres, u.apellidos, u.cedula, u.role AS cargo, u.fecha_ingreso
      FROM roles_pago r
      JOIN users u ON r.id_trabajador = u.id
      WHERE r.id = ?`, {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
    });

    const rol = roles[0];

    if (!rol) {
      return res.status(404).json({ mensaje: 'Rol no encontrado' });
    }

    await generarPDFColaborador(res, rol, [rol], rol.id_trabajador);

  } catch (error) {
    console.error('Error al generar PDF del rol:', error);
    res.status(500).json({ mensaje: 'Error al generar PDF' });
  }
};

module.exports = {
  protegerRuta,
  verRolesPagoVista,
  listarMisRoles,
  generarPDFPorRol,
};
