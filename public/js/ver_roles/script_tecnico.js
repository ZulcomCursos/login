// Función para inicializar lógica roles técnico
function initRolesTecnico(usuarioId) {
    const filtroMes = document.getElementById('filtroMes');
    const tablaRoles = document.getElementById('tabla-roles');
    if (!filtroMes || !tablaRoles) return;

    async function cargarRoles(mes = '') {
        try {
            let url = `/rolpago/tecnico/roles`;
            if (mes) url += `?mes=${encodeURIComponent(mes)}`;

            const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!res.ok) throw new Error('Error al obtener roles');
            const roles = await res.json();

            tablaRoles.innerHTML = '';
            if (roles.length === 0) {
                tablaRoles.innerHTML = '<tr><td colspan="5" class="text-center">No hay registros</td></tr>';
                return;
            }

            roles.forEach((rol) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rol.periodo}</td>
                    <td>$${parseFloat(rol.salario).toFixed(2)}</td>
                    <td>$${parseFloat(rol.total).toFixed(2)}</td>
                    <td>${rol.estado}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="descargarMiComprobante(${rol.id_trabajador})">PDF</button>
                    </td>
                `;
                tablaRoles.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            tablaRoles.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar roles</td></tr>';
        }
    }

    filtroMes.addEventListener('change', () => {
        cargarRoles(filtroMes.value);
    });

    cargarRoles(); // carga inicial
}

// Abrir PDF en nueva ventana
function descargarMiComprobante(idRolPago) {
    window.open(`/rolpago/pdf/${idRolPago}`, '_blank');
}

// Cargar contenido SPA dentro del dashboard sin recargar toda la página
async function loadContent(url, pushHistory = true) {
    try {
        // 🚫 Si es el dashboard, hacemos recarga completa
        if (url === '/dashboard/tecnico') {
            window.location.href = url;
            return;
        }

        const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!res.ok) throw new Error('Error al cargar contenido');
        const html = await res.text();
        document.getElementById('content').innerHTML = html;

        // Detecta rutas para inicializar el script de roles técnico
        if (url.startsWith('/rolpago/tecnico/ver')) {
            const usuarioId = document.body.getAttribute('data-usuario-id');
            if (usuarioId) initRolesTecnico(usuarioId);
        }

        // Actualiza historial si es navegación nueva
        if (pushHistory) {
            window.history.pushState({ url }, '', url);
        }
    } catch (error) {
        console.error(error);
        document.getElementById('content').innerHTML = '<p class="text-danger">Error al cargar contenido.</p>';
    }
}

// Inicialización SPA
document.addEventListener('DOMContentLoaded', () => {
    // Captura clicks en enlaces con clase .spa-link
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.spa-link');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !link.hasAttribute('target')) {
                e.preventDefault();
                loadContent(href, true);
            }
        }
    });

    // Botones atrás/adelante del navegador
    window.addEventListener('popstate', (event) => {
        const url = event.state?.url || window.location.pathname;
        loadContent(url, false);
    });

    // Si el usuario recarga estando en una ruta interna SPA
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/rolpago/tecnico/ver')) {
        loadContent(currentPath, false);
    }
});
