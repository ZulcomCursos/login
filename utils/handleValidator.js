const { validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render(req.originalUrl, {
        title: 'Registro',
        errors: errors.array().map(err => err.msg), // Convertir a array de mensajes
        formData: req.body
      });
    }
    return next();
  } catch (e) {
    console.error(e);
    return res.render(req.originalUrl, {
      title: 'Registro',
      errors: ['Error en la validación'],
      formData: req.body
    });
  }
};

module.exports = validateResults;