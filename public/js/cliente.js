
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

    function buscarPorCedulaExacta() {
      const cedulaExacta = cedulaInput.value.trim();
      const filas = document.querySelectorAll("table tbody tr");

      filas.forEach(fila => {
        const cedula = fila.querySelector("td").textContent.trim();
        fila.style.display = cedula === cedulaExacta ? "" : "none";
      });
    }

    function limpiarFiltros() {
      cedulaInput.value = "";
      nombreInput.value = "";
      apellidoInput.value = "";
      estadoSelect.value = "";
      planInput.value = "";

      const filas = document.querySelectorAll("table tbody tr");
      filas.forEach(fila => fila.style.display = "");
    }

    // Eventos para filtro dinámico
    cedulaInput.addEventListener('keyup', filtrarTabla);
    nombreInput.addEventListener('keyup', filtrarTabla);
    apellidoInput.addEventListener('keyup', filtrarTabla);
    estadoSelect.addEventListener('change', filtrarTabla);
    planInput.addEventListener('keyup', filtrarTabla);
 