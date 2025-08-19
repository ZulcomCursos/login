const { validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Determinar la vista a renderizar basada en la ruta
      let view;
      if (req.originalUrl.includes('/login')) {
        view = 'auth/login';
      } else if (req.originalUrl.includes('/register-step1')) {
        view = 'auth/register-step1';
      } else {
        view = 'auth/login'; // Vista por defecto
      }

      // Extraer solo los mensajes de error
      const errorMessages = errors.array().map(err => err.msg);
      
      return res.render(view, {
        title: view === 'auth/login' ? 'Iniciar Sesión' : 'Registro',
        errors: errorMessages,
        formData: req.body // Mantener los datos del formulario
      });
    }
    return next();
  } catch (e) {
    console.error('Error en validateResults:', e);
    return res.render('auth/login', {
      title: 'Error',
      errors: ['Ocurrió un error al procesar la solicitud'],
      formData: req.body
    });
  }
};

module.exports = validateResults;