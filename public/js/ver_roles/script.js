// ===============================
// Función principal para inicializar la lógica de Roles de Pago
// ===============================
function initRolesPago() {
  const filtroMes = document.getElementById('filtroMes');
  const tablaRoles = document.getElementById('tabla-roles');

  if (!filtroMes || !tablaRoles) return; // Seguridad: si no existe la vista, no hace nada

  // Cargar Roles de Pago (opcionalmente filtrados por mes)
  async function cargarRoles(mes = '') {
    try {
      const res = await fetch('/mis-roles/data');
      if (!res.ok) throw new Error('Error al obtener roles');

      const roles = await res.json();
      tablaRoles.innerHTML = '';

      const filtrados = mes ? roles.filter(r => r.periodo === mes) : roles;

      if (filtrados.length === 0) {
        tablaRoles.innerHTML = '<tr><td colspan="5" class="text-center">No hay registros</td></tr>';
        return;
      }

      filtrados.forEach(rol => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${rol.periodo}</td>
          <td>$${parseFloat(rol.salario).toFixed(2)}</td>
          <td>$${parseFloat(rol.total).toFixed(2)}</td>
          <td>${rol.estado}</td>
          <td><a href="/rolpago/pdf/${rol.id_trabajador}" class="btn btn-sm btn-danger" target="_blank" rel="noopener noreferrer">PDF</a></td>
        `;
        tablaRoles.appendChild(tr);
      });
    } catch (error) {
      console.error('Error en cargarRoles:', error);
      tablaRoles.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar roles</td></tr>';
    }
  }

  // Listener de filtro por mes
  filtroMes.addEventListener('change', () => {
    cargarRoles(filtroMes.value);
  });

  // Cargar todos los roles al inicio
  cargarRoles();
}


// ===============================
// Función global para cargar vistas dinámicamente en el Dashboard
// ===============================
window.loadContent = async function(url) {
  try {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) throw new Error('No se encontró el contenedor #content');

    // Rutas administrativas con recarga completa
    if (url.startsWith('/dashboard/administracion')) {
      window.location.href = url;
      return;
    }

    // Función para insertar HTML y ejecutar initRolesPago si corresponde
    const insertarVista = async () => {
      const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error('Error al cargar vista');
      contentDiv.innerHTML = await response.text();

      // Inicializar Roles de Pago si la vista corresponde
      if (url.startsWith('/mis-roles/ver') && typeof initRolesPago === 'function') {
        initRolesPago();

        // VERIFICACIÓN ADICIONAL: si la tabla está vacía, recargar roles al instante
        const tablaRoles = document.getElementById('tabla-roles');
        if (tablaRoles && tablaRoles.children.length === 0) {
          initRolesPago(); // Esto asegura que la tabla se llene al primer clic
        }
      }
    };

    // Para la vista de Roles de Pago: cargar script primero si no existe
    if (url.startsWith('/mis-roles/ver')) {
      if (!document.getElementById('script-roles-pago')) {
        const script = document.createElement('script');
        script.id = 'script-roles-pago';
        script.src = '/ver_roles/script.js';
        script.onload = insertarVista; // Ejecuta solo cuando el script está listo
        document.body.appendChild(script);
      } else {
        insertarVista();
      }
    } else {
      // Para otras vistas SPA
      await insertarVista();
    }

  } catch (err) {
    console.error('Error en loadContent:', err);
    const contentDiv = document.getElementById('content');
    if (contentDiv) contentDiv.innerHTML = '<p class="text-danger">Error al cargar la vista</p>';
  }
};


// ===============================
// SPA: interceptar clicks de menú y navegación por historial
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  // Clicks en enlaces SPA
  document.querySelectorAll('.spa-link').forEach(link => {
    link.addEventListener('click', function(event) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('/') && !this.hasAttribute('target')) {
        event.preventDefault();
        loadContent(href);
        window.history.pushState({ url: href }, '', href);
      }
    });
  });

  // Navegación por botones atrás/adelante
  window.addEventListener('popstate', function(event) {
    const url = event.state?.url || window.location.pathname;
    if (url.startsWith('/dashboard/administracion')) {
      window.location.href = url;
    } else if (url) {
      loadContent(url);
    }
  });
});
