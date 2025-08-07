const { validationResult } = require("express-validator");
const Plan = require("../models/mysql/Plan"); // para cargar los planes si hay error

const validateResults = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const errorMessage = errorList[0].msg;

    const planes = await Plan.findAll();

    // Detectar si es edición por la URL (ej: /clientes/5 o /clientes/5/edit)
    const isEdit = req.originalUrl.includes('/edit') || req.originalUrl.match(/\/\d+$/);

    if (isEdit) {
      return res.status(400).render('clientes/edit', {
        cliente: req.body,
        planes,
        error: errorMessage,
        user: req.user
      });
    } else {
      return res.status(400).render('clientes/create', {
        planes,
        error: errorMessage,
        user: req.user
      });
    }
  }

  next(); // Si no hay errores, continúa con el siguiente middleware/controlador
};

module.exports = validateResults;
