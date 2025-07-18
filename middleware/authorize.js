const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // Usuario no tiene el rol requerido
      return res.status(403).render('error', {
        title: 'Acceso denegado',
        message: 'No tienes permiso para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = authorize;