// Función principal para inicializar la lógica de Roles de Pago
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
          <td><a href="/rolpago/pdf/${rol.id}" class="btn btn-sm btn-danger" target="_blank" rel="noopener noreferrer">PDF</a></td>
        `;
        tablaRoles.appendChild(tr);
      });
    } catch (error) {
      console.error('Error en cargarRoles:', error);
      tablaRoles.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar roles</td></tr>';
    }
  }

  // Limpia listeners antiguos y agrega uno nuevo al filtroMes
  const nuevoFiltroMes = filtroMes.cloneNode(true);
  filtroMes.parentNode.replaceChild(nuevoFiltroMes, filtroMes);

  nuevoFiltroMes.addEventListener('change', () => {
    cargarRoles(nuevoFiltroMes.value);
  });

  cargarRoles(); // Cargar todos al inicio
}

// Función global para cargar vistas dinámicamente en el Dashboard
window.loadContent = async function(url) {
  try {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!response.ok) throw new Error('Error al cargar vista');

    const html = await response.text();
    const contentDiv = document.getElementById('content');
    if (!contentDiv) throw new Error('No se encontró el contenedor #content');

    contentDiv.innerHTML = html;

    // Si la URL corresponde a Roles de Pago, cargar script e inicializar
    if (url.startsWith('/mis-roles/ver')) {
      if (!document.getElementById('script-roles-pago')) {
        const script = document.createElement('script');
        script.id = 'script-roles-pago';
        script.src = '/ver_roles/script.js'; // Ruta donde tienes tu lógica initRolesPago
        script.onload = () => {
          if (typeof initRolesPago === 'function') initRolesPago();
        };
        document.body.appendChild(script);
      } else {
        if (typeof initRolesPago === 'function') initRolesPago();
      }
    }
  } catch (err) {
    console.error('Error en loadContent:', err);
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = '<p class="text-danger">Error al cargar la vista</p>';
    }
  }
};

// Interceptar clicks de menú para navegación dinámica (SPA)
document.addEventListener('DOMContentLoaded', function() {
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

  // Manejar navegación por el botón de atrás/adelante
  window.addEventListener('popstate', function(event) {
    const url = event.state?.url || window.location.pathname;
    if (url) {
      loadContent(url);
    }
  });
});
