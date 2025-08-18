const RolPago = require('../models/mysql/rolpago');
const { sequelize } = require('../config/mysql');
const { QueryTypes } = require('sequelize');
const { generarPDFColaborador } = require('../services/pdfGenerator');

const crearRolPago = async (req, res) => {
  try {
    const {
      id_trabajador,
      salario,
      cantidad_horas_extra, // <-- coincide con tu front
      decimos,
      bonos,
      descuentos,
      periodo,
    } = req.body;

    if (!salario || isNaN(salario)) {
      return res.status(400).json({ mensaje: "Salario inválido o no proporcionado" });
    }

    const salarioNum = parseFloat(salario);
    const horasExtrasNum = parseFloat(cantidad_horas_extra) || 0; // <-- usamos esta variable

    const horasTrabajadasAlMes = 240;
    const valorHoraNormal = salarioNum / horasTrabajadasAlMes;

    // Pago por horas extras (150%)
    const pagoHorasExtra = horasExtrasNum * valorHoraNormal * 1.5;

    // Base para cálculos de aportes
    const baseAportes = salarioNum + pagoHorasExtra;

    // Calcular aportes
    const aporte_iess = parseFloat((baseAportes * 0.0945).toFixed(2));
    const aporte_empleador = parseFloat((baseAportes * 0.1115).toFixed(2));



    // Total neto
    const total =
      salarioNum +
      pagoHorasExtra +
      (parseFloat(decimos) || 0) +
      (parseFloat(bonos) || 0) -
      (parseFloat(descuentos) || 0) -
      aporte_iess;

    // Guardar datos en tabla RolPago
    const datosRol = {
      id_trabajador,
      periodo,
      salario: salarioNum,
      horas_extra: horasExtrasNum, // <-- aquí se asigna correctamente
      valor_horas_extras: parseFloat(pagoHorasExtra.toFixed(2)),
      decimos: parseFloat(decimos || 0),
      aporte_iess,
      aporte_empleador,
      bonos: parseFloat(bonos || 0),
      descuentos: parseFloat(descuentos || 0),
      total: parseFloat(total.toFixed(2)),
      estado: "generado",
    };

    await RolPago.create(datosRol);

    return res.status(200).json({
      mensaje: "Rol de pago generado exitosamente",
      datos: datosRol
    });
  } catch (error) {
    console.error("Error al crear rol de pago:", error);
    return res.status(500).json({ mensaje: "Error al generar el rol de pago" });
  }
};


const listarRolesPago = async (req, res) => {
  try {
    const { mes, colaborador } = req.query;  // Recibir filtros desde query params

    // Base del query y los replacements para seguridad
    let query = `
      SELECT r.*, u.nombres, u.apellidos, u.role AS cargo
      FROM roles_pago r
      JOIN users u ON r.id_trabajador = u.id
    `;

    let whereClauses = [];
    let replacements = [];

    // Permitir que técnicos/admin vean solo sus roles, o filtros desde frontend
    if (req.session?.usuario && (req.session.usuario.role === 'Tecnico' || req.session.usuario.role === 'Administracion')) {
      whereClauses.push(`r.id_trabajador = ?`);
      replacements.push(req.session.usuario.id);
    } else {
      // Si no es técnico/admin, aplicar filtros enviados por frontend
      if (colaborador) {
        whereClauses.push(`r.id_trabajador = ?`);
        replacements.push(colaborador);
      }
    }

    // Filtro por mes (periodo en formato 'YYYY-MM')
    if (mes) {
      whereClauses.push(`r.periodo = ?`);
      replacements.push(mes);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Orden para mostrar primero los más recientes
    query += ' ORDER BY r.periodo DESC, r.id DESC';

    // Ejecutar consulta con filtros y seguridad contra inyección SQL
    const [roles] = await sequelize.query(query, { replacements });

    return res.json(roles);

  } catch (error) {
    console.error('Error al listar roles de pago:', error);
    return res.status(500).json({ mensaje: 'Error al listar roles de pago' });
  }
};

// ✅ Generar PDF de Roles de un colaborador
const generarPDF = async (req, res) => {
  try {
    const { id_trabajador } = req.params;

    const colaboradores = await sequelize.query(
      `SELECT id, nombres, apellidos, cedula, role AS cargo
       FROM users 
       WHERE id = ?`,
      { replacements: [id_trabajador], type: QueryTypes.SELECT }
    );

    const colaborador = colaboradores[0];
    if (!colaborador) {
      return res.status(404).json({ mensaje: 'Colaborador no encontrado' });
    }

    const roles = await RolPago.findAll({
      where: { id_trabajador },
      order: [['id', 'DESC']],
    });

    if (!roles || roles.length === 0) {
      return res.status(404).json({ mensaje: 'No hay roles de pago para este colaborador' });
    }

    await generarPDFColaborador(res, colaborador, roles, id_trabajador);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    return res.status(500).json({ mensaje: 'Error al generar PDF' });
  }
};

module.exports = {
  crearRolPago,
  listarRolesPago,
  generarPDF
};
