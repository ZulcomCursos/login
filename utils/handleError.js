const handleHttpError = (res, message = "Algo sucedió", code = 403) => {
  res.status(code);
  
  // Para respuestas API
  if (res.req.originalUrl.startsWith('/api')) {
    return res.send({ error: message });
  }
  
  // Para vistas
  const view = res.req.originalUrl.includes('login') ? 'auth/login' : 'auth/register';
  const title = res.req.originalUrl.includes('login') ? 'Iniciar Sesión' : 'Registro';
  
  return res.render(view, {
    title,
    errors: [message],
    formData: res.req.body
  });
};

module.exports = { handleHttpError };