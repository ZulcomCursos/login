window.loadContent = async function(url) {
  try {
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error(`Error al cargar vista: ${res.status} ${res.statusText}`);
    const html = await res.text();

    const contentDiv = document.getElementById('contenido-dinamico'); 
    if (!contentDiv) throw new Error('No se encontró el contenedor #contenido-dinamico');
    contentDiv.innerHTML = html;

    // Cargar colaboradores en filtros y asignar listeners para filtros en el tab listado
    if (url === '/rolpago/crear' || url === '/rolpago/ver' || url === '/rolpago/listar') {
      await cargarFiltroColaboradores();
      asignarListenersFiltros();
      cargarListadoRoles();
    }

    // Agregar listener para cargar listado de roles al activar el tab "Listado"
    const listadoTabBtn = document.getElementById('listado-tab');
    if (listadoTabBtn) {
      listadoTabBtn.addEventListener('shown.bs.tab', () => {
        cargarListadoRoles();
      });
    }

    // Si cargamos la vista de crear roles, cargar colaboradores para formulario
    if (url === '/rolpago/crear') {
      await cargarColaboradores();

      // Cargar script.js para Crear Roles de Pago
      if (!document.getElementById('script-crear-rolpago')) {
        const script = document.createElement('script');
        script.id = 'script-crear-rolpago';
        script.src = '/js/js_rolpago/script.js?t=' + new Date().getTime();
        script.onload = () => { if (typeof init === 'function') init(); };
        script.onerror = () => console.error('Error al cargar script.js de Crear Roles de Pago');
        document.body.appendChild(script);
      } else {
        if (typeof init === 'function') init();
      }
    }

    // Cargar script.js para Ver Roles de Pago
    if (url === '/rolpago/ver') {
      if (!document.getElementById('script-roles-pago')) {
        const script = document.createElement('script');
        script.id = 'script-roles-pago';
        script.src = '/js/ver_roles/script.js?t=' + new Date().getTime();
        script.onload = () => { if (typeof initRolesPago === 'function') initRolesPago(); };
        script.onerror = () => console.error('Error al cargar script.js de Ver Roles de Pago');
        document.body.appendChild(script);
      } else {
        if (typeof initRolesPago === 'function') initRolesPago();
      }
    }

  } catch (err) {
    console.error('Error en loadContent:', err);
    const contentDiv = document.getElementById('contenido-dinamico');
    if (contentDiv) contentDiv.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
};

// Función para cargar colaboradores en el formulario
async function cargarColaboradores() {
  try {
    const res = await fetch('/rolpago/colaboradores');
    if (!res.ok) throw new Error(`Error al obtener colaboradores: ${res.status} ${res.statusText}`);
    const colaboradores = await res.json();

    const select = document.getElementById('colaboradoresSelect');
    if (!select) throw new Error('No se encontró el select colaboradoresSelect');

    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione un colaborador';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    colaboradores.forEach(col => {
      const option = document.createElement('option');
      option.value = col.id_trabajador;
      option.textContent = `${col.nombres} ${col.apellidos}`;
      option.dataset.cargo = col.cargo;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando colaboradores:', error);
    alert('Error cargando colaboradores: ' + error.message);
  }
}

// Función para cargar colaboradores para filtro listado
async function cargarFiltroColaboradores() {
  try {
    const res = await fetch('/rolpago/colaboradores');
    if (!res.ok) throw new Error(`Error al obtener colaboradores: ${res.status} ${res.statusText}`);
    const colaboradores = await res.json();

    const filtroColaborador = document.getElementById('filtroColaborador');
    if (!filtroColaborador) throw new Error('No se encontró el select filtroColaborador');

    filtroColaborador.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos los colaboradores';
    filtroColaborador.appendChild(defaultOption);

    colaboradores.forEach(col => {
      const option = document.createElement('option');
      option.value = col.id_trabajador;
      option.textContent = `${col.nombres} ${col.apellidos}`;
      filtroColaborador.appendChild(option);
    });

  } catch (error) {
    console.error('Error cargando colaboradores para filtro:', error);
    alert('Error cargando colaboradores para filtro: ' + error.message);
  }
}

// Función para asignar listeners a los selects de filtro
function asignarListenersFiltros() {
  const filtroMes = document.getElementById('filtroMes');
  const filtroColaborador = document.getElementById('filtroColaborador');

  if (filtroMes && filtroColaborador) {
    filtroMes.addEventListener('change', () => {
      cargarListadoRoles(filtroMes.value, filtroColaborador.value);
    });

    filtroColaborador.addEventListener('change', () => {
      cargarListadoRoles(filtroMes.value, filtroColaborador.value);
    });
  }
}

// Función para cargar listado de roles en tabla con filtros
async function cargarListadoRoles(filtroMes = '', filtroColaborador = '') {
  const tbody = document.getElementById('tabla-roles');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';

  try {
    let url = '/rolpago/listar';
    const params = new URLSearchParams();
    if (filtroMes) params.append('mes', filtroMes);
    if (filtroColaborador) params.append('colaborador', filtroColaborador);
    if ([...params].length > 0) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al obtener roles: ${res.status} ${res.statusText}`);
    const roles = await res.json();

    if (roles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay roles para mostrar</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    roles.forEach(rol => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rol.id}</td>
        <td>${rol.nombres} ${rol.apellidos}</td>
        <td>${rol.cargo}</td>
        <td>${rol.periodo}</td>
        <td>${rol.salario}</td>
        <td>${rol.total}</td>
        <td>${rol.estado}</td>
        <td>
          <a href="/rolpago/pdf/${rol.id_trabajador}" target="_blank" class="btn btn-sm btn-success" title="Descargar PDF">
            Descargar
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar roles</td></tr>`;
    console.error('Error en cargarListadoRoles:', error);
    alert('Error al cargar listado de roles: ' + error.message);
  }
}

// Función para llenar el periodo automáticamente
function llenarPeriodoActual() {
  const periodoEl = document.getElementById('periodo');
  if (!periodoEl) return;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  let mes = hoy.getMonth() + 1;
  if (mes < 10) mes = '0' + mes;

  periodoEl.value = `${anio}-${mes}`;
}

// Función init que activa el submit para crear rol
function init() {
  llenarPeriodoActual(); // <<--- LLENADO AUTOMÁTICO DEL PERIODO

  const form = document.getElementById('formularioRol');
  if (!form) return;

  const mensajeDiv = document.getElementById('mensaje');
  if (!mensajeDiv) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id_trabajadorEl = document.getElementById('colaboradoresSelect');
    const periodoEl = document.getElementById('periodo');
    const salarioEl = document.getElementById('salario');
    const horasExtraEl = document.getElementById('cantidad_horas_extra');
    const decimosEl = document.getElementById('decimos');
    const bonosEl = document.getElementById('bonos');
    const descuentosEl = document.getElementById('descuentos');

    if (!id_trabajadorEl || !periodoEl || !salarioEl) return;

    const id_trabajador = id_trabajadorEl.value;
    const periodo = periodoEl.value;
    const salario = parseFloat(salarioEl.value);
    const cantidad_horas_extra = parseFloat(horasExtraEl?.value) || 0;
    const decimos = parseFloat(decimosEl?.value) || 0;
    const bonos = parseFloat(bonosEl?.value) || 0;
    const descuentos = parseFloat(descuentosEl?.value) || 0;

    if (!id_trabajador) {
      mensajeDiv.textContent = 'Por favor, seleccione un colaborador.';
      mensajeDiv.className = 'text-danger mt-3';
      return;
    }

    if (!periodo.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
      mensajeDiv.textContent = 'Ingrese un periodo válido (formato YYYY-MM).';
      mensajeDiv.className = 'text-danger mt-3';
      return;
    }

    if (isNaN(salario) || salario <= 0) {
      mensajeDiv.textContent = 'Por favor, ingrese un salario válido mayor a 0.';
      mensajeDiv.className = 'text-danger mt-3';
      return;
    }

    const data = { id_trabajador, periodo, salario, cantidad_horas_extra, decimos, bonos, descuentos };

    try {
      const res = await fetch('/rolpago/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        mensajeDiv.textContent = result.mensaje || 'Rol de pago generado exitosamente.';
        mensajeDiv.className = 'text-success mt-3';
        form.reset();
        llenarPeriodoActual(); // resetear periodo al valor actual

        // actualizar listado solo para el colaborador creado
        const filtroMesVal = document.getElementById('filtroMes')?.value || '';
        cargarListadoRoles(filtroMesVal, id_trabajador);
      } else {
        mensajeDiv.textContent = result.mensaje || 'Error al generar rol de pago.';
        mensajeDiv.className = 'text-danger mt-3';
        console.error('Error al crear rol:', result);
      }
    } catch (error) {
      mensajeDiv.textContent = 'Error de conexión al generar rol de pago.';
      mensajeDiv.className = 'text-danger mt-3';
      console.error('Error en fetch /rolpago/crear:', error);
      alert('Error de conexión: ' + error.message);
    }
  });
}

// Configurar links SPA (si usas navegación SPA)
function configurarSpaLinks() {
  document.querySelectorAll('.spa-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('/') && !this.hasAttribute('target')) {
        e.preventDefault();
        window.loadContent(href);
        window.history.pushState({ url: href }, '', href);
      }
    });
  });
}

window.addEventListener('popstate', function(event) {
  const url = event.state?.url || window.location.pathname;
  if (url) window.loadContent(url);
});

document.addEventListener('DOMContentLoaded', () => {
  configurarSpaLinks();

  const rutasSpa = ['/rolpago/crear', '/rolpago/ver', '/rolpago/listar'];
  if (rutasSpa.includes(window.location.pathname)) {
    window.loadContent(window.location.pathname);
  }
});
