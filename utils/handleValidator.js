const { validationResult } = require("express-validator");

const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (err) {
    const errors = err.array();
    const errorMessages = errors.map(error => error.msg);
    
    // Para rutas de API
    if (req.originalUrl.startsWith('/api')) {
      return res.status(403).json({ errors: err.array() });
    }
    
    // Para vistas
    return res.render(req.originalUrl.includes('login') ? 'auth/login' : 'auth/register', {
      title: req.originalUrl.includes('login') ? 'Iniciar Sesión' : 'Registro',
      errors: errorMessages,
      formData: req.body // Mantener los datos del formulario
    });
  }
};

module.exports = validateResults;