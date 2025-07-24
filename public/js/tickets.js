document.addEventListener('DOMContentLoaded', function () {
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
      alert('Por favor ingrese una cédula');
      return;
    }

    fetch(`/tickets/search-client?cedula=${cedula}`)
      .then(response => {
        if (response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
        if (!response.ok) {
          throw new Error('Error al buscar el cliente');
        }
        return response.json();
      })
      .then(client => {
        document.getElementById('clientName').textContent = `${client.nombre} ${client.apellido}`;
        document.getElementById('clientPhone').textContent = client.telefono1;
        document.getElementById('clientEmail').textContent = client.correo;
        document.getElementById('clientAddress').textContent = client.direccion;
        document.getElementById('clientId').value = client.id_cliente;
        document.getElementById('clientInfo').style.display = 'block';
      })
      .catch(error => {
        alert(error.message);
        document.getElementById('clientInfo').style.display = 'none';
        document.getElementById('clientName').textContent = '';
        document.getElementById('clientPhone').textContent = '';
        document.getElementById('clientEmail').textContent = '';
        document.getElementById('clientAddress').textContent = '';
        document.getElementById('clientId').value = '';
      });
  }
});
