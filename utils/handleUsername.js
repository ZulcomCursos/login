function generateUsername(nombres, apellidos) {
  // Dividir nombres y apellidos
  const nombresArray = nombres.split(' ');
  const apellidosArray = apellidos.split(' ');
  
  // Obtener primera letra del primer nombre
  const primeraLetraNombre = nombresArray[0].charAt(0).toLowerCase();
  
  // Obtener primer apellido completo
  const primerApellido = apellidosArray[0].toLowerCase();
  
  // Obtener primera letra del segundo apellido (si existe)
  const segundaLetraApellido = apellidosArray.length > 1 
    ? apellidosArray[1].charAt(0).toLowerCase() 
    : '';
  
  return primeraLetraNombre + primerApellido + segundaLetraApellido;
}

module.exports = generateUsername;