
  document.addEventListener('DOMContentLoaded', function() {
    // Estado para controlar si mostramos el mensaje
    let shouldShowPrompt = true;
    
    // Agregamos un estado al historial al cargar la página
    history.pushState({showPrompt: false}, '');
    
    // Evento para cuando se intenta navegar hacia atrás/adelante
    window.onpopstate = function(event) {
      // Solo mostrar el mensaje si shouldShowPrompt es true
      // y si estamos retrocediendo a la página de login
      if (shouldShowPrompt && (event.state === null || !event.state.showPrompt)) {
        const confirmLeave = confirm('¿Estás seguro que deseas cerrar sesión?');
        if (confirmLeave) {
          // Si confirma, redirigir al logout
          window.location.href = '/auth/logout';
        } else {
          // Si cancela, volver a agregar el estado actual
          shouldShowPrompt = false;
          history.pushState({showPrompt: false}, '');
          shouldShowPrompt = true;
        }
      }
    };
    
    // Manejar clics normales en el navbar (excepto logout)
    document.querySelectorAll('nav a:not([href="/auth/logout"])').forEach(link => {
      link.addEventListener('click', function(e) {
        // Marcamos que no debe mostrar el prompt para esta navegación
        shouldShowPrompt = false;
        // Agregamos un nuevo estado al historial
        history.pushState({showPrompt: true}, '');
        shouldShowPrompt = true;
      });
    });
    
    // Manejar el botón de logout por separado
    document.querySelector('a[href="/auth/logout"]').addEventListener('click', function(e) {
      // No necesitamos manejar el historial aquí
      return confirm('¿Estás seguro de cerrar sesión?');
    });
  });
