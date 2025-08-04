document.addEventListener('DOMContentLoaded', function () {
  // ===============================
  // 1️⃣ Buscar cliente por cédula
  // ===============================
  const searchClientBtn = document.getElementById('searchClientBtn');
  const cedulaInput = document.getElementById('cedula');

  if (searchClientBtn && cedulaInput) {
    searchClientBtn.addEventListener('click', searchClient);
    cedulaInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchClient();
      }
    });
  }

  function searchClient() {
    const cedula = cedulaInput.value.trim();

    if (!cedula) {
      alert('⚠️ Por favor ingresa una cédula');
      return;
    }

    fetch(`/tickets/search-client?cedula=${cedula}`)
      .then(response => {
        if (response.status === 404) throw new Error('❌ Cliente no encontrado');
        if (!response.ok) throw new Error('❌ Error al buscar el cliente');
        return response.json();
      })
      .then(cliente => llenarInformacionCliente(cliente))
      .catch(error => {
        alert(error.message);
        limpiarInfoCliente();
      });
  }

  function llenarInformacionCliente(cliente) {
    document.getElementById('clientName').textContent = `${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('clientPhone').textContent = cliente.telefono1 || '—';
    document.getElementById('clientEmail').textContent = cliente.correo || '—';
    document.getElementById('clientAddress').textContent = cliente.direccion || '—';
    document.getElementById('clientIP').textContent = cliente.ip || '—';
    document.getElementById('clientReferences').textContent = cliente.referencias || '—';
    document.getElementById('clientId').value = cliente.id_cliente;

    document.getElementById('clientInfo').style.display = 'block';
  }

  function limpiarInfoCliente() {
    const campos = ['clientName', 'clientPhone', 'clientEmail', 'clientAddress', 'clientIP', 'clientReferences'];
    campos.forEach(id => document.getElementById(id).textContent = '');
    document.getElementById('clientId').value = '';
    document.getElementById('clientInfo').style.display = 'none';
  }

  // ===============================
  // 2️⃣ Validar formulario de ticket
  // ===============================
  const ticketForm = document.getElementById('ticketForm');

  if (ticketForm) {
    ticketForm.addEventListener('submit', function (e) {
      const clientId = document.getElementById('clientId').value.trim();
      const issueType = document.getElementById('issueType')?.value || '';
      const tecnicoId = document.getElementById('tecnicoId')?.value || '';
      const description = document.getElementById('description')?.value.trim();

      if (!clientId || !issueType || !tecnicoId || !description) {
        e.preventDefault();
        alert('⚠️ Completa todos los campos obligatorios antes de enviar.');
      }
    });
  }

  // ===============================
  // 3️⃣ Filtro avanzado de tickets
  // ===============================
  const filtroForm = document.getElementById('filtroAvanzadoForm');

  if (filtroForm) {
    filtroForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const estado = document.getElementById('estadoFiltro')?.value || '';
      const tecnico = document.getElementById('tecnicoFiltro')?.value || '';
      const problema = document.getElementById('tipoProblemaFiltro')?.value || '';
      const fechaInicio = document.getElementById('fechaInicio')?.value || '';
      const fechaFin = document.getElementById('fechaFin')?.value || '';

      const params = new URLSearchParams();

      if (estado) params.append('estado', estado);
      if (tecnico) params.append('tecnico', tecnico);
      if (problema) params.append('problema', problema);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      window.location.href = `/tickets?${params.toString()}`;
    });
  }

  // ===============================
  // 4️⃣ Mostrar/ocultar campo precio y hora actual en resolver ticket
  // ===============================
  const fechaSol = document.getElementById('fechaSol');
  const horaSol = document.getElementById('horaSol');

  if (fechaSol && horaSol) {
    const ahora = new Date();
    fechaSol.innerText = ahora.toLocaleDateString('es-EC');
    horaSol.innerText = ahora.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  const tieneCosto = document.getElementById('tieneCosto');
  const campoPrecio = document.getElementById('campoPrecio');
  const precioInput = document.getElementById('precio');

  if (tieneCosto && campoPrecio && precioInput) {
    tieneCosto.addEventListener('change', () => {
      if (tieneCosto.checked) {
        campoPrecio.style.display = 'block';
        precioInput.setAttribute('required', 'required');
      } else {
        campoPrecio.style.display = 'none';
        precioInput.removeAttribute('required');
        precioInput.value = '';
      }
    });
  }
});
