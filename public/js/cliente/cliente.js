document.addEventListener("DOMContentLoaded", () => {
  // Filtros de tabla
  const cedulaInput = document.getElementById('filtroCedula');
  const nombreInput = document.getElementById('filtroNombre');
  const apellidoInput = document.getElementById('filtroApellido');
  const estadoSelect = document.getElementById('filtroEstado');
  const planInput = document.getElementById('filtroPlan');

  function filtrarTabla() {
    const filas = document.querySelectorAll("table tbody tr");

    filas.forEach(fila => {
      const celdas = fila.querySelectorAll("td");
      const cedula = celdas[0].textContent.toLowerCase();
      const nombre = celdas[1].textContent.toLowerCase();
      const apellido = celdas[2].textContent.toLowerCase();
      const estado = celdas[7].textContent.toLowerCase();
      const plan = celdas[8].textContent.toLowerCase();

      const coincide =
        cedula.includes(cedulaInput.value.toLowerCase()) &&
        nombre.includes(nombreInput.value.toLowerCase()) &&
        apellido.includes(apellidoInput.value.toLowerCase()) &&
        estado.includes(estadoSelect.value.toLowerCase()) &&
        plan.includes(planInput.value.toLowerCase());

      fila.style.display = coincide ? "" : "none";
    });
  }

  // Eventos de filtro
  if (cedulaInput) cedulaInput.addEventListener('keyup', filtrarTabla);
  if (nombreInput) nombreInput.addEventListener('keyup', filtrarTabla);
  if (apellidoInput) apellidoInput.addEventListener('keyup', filtrarTabla);
  if (estadoSelect) estadoSelect.addEventListener('change', filtrarTabla);
  if (planInput) planInput.addEventListener('keyup', filtrarTabla);

  // Validaciones en tiempo real
  const cedula = document.getElementById("cedula");
  const nombre = document.getElementById("nombre");
  const apellido = document.getElementById("apellido");
  const ip = document.getElementById("ip");
  const telefono1 = document.getElementById("telefono1");
  const telefono2 = document.getElementById("telefono2");

  const soloLetras = /[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g;

  if (cedula) {
    cedula.addEventListener("input", () => {
      cedula.value = cedula.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  if (nombre) {
    nombre.addEventListener("input", () => {
      nombre.value = nombre.value.replace(soloLetras, '');
    });
  }

  if (apellido) {
    apellido.addEventListener("input", () => {
      apellido.value = apellido.value.replace(soloLetras, '');
    });
  }

  if (ip) {
    ip.addEventListener("input", () => {
      ip.value = ip.value.replace(/[^0-9.]/g, '');
    });
  }

  if (telefono1) {
    telefono1.addEventListener("input", () => {
      telefono1.value = telefono1.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }

  if (telefono2) {
    telefono2.addEventListener("input", () => {
      telefono2.value = telefono2.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
  }
});
