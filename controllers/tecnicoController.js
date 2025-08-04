resolverTicket: async (req, res) => {
  try {
    const { id } = req.params;
    // Añadir los campos tieneCosto y precio para capturar del form
    const { solution, status, tieneCosto, precio } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).send('Ticket no encontrado');
    }

    ticket.solution = solution;
    ticket.status = status;

    // Guardar precio solo si el checkbox está marcado
    if (tieneCosto === 'on') {
      ticket.precio = precio ? parseFloat(precio) : null;
    } else {
      ticket.precio = null;
    }

    if (status === 'cerrado' || status === 'completado') {
      const now = new Date();
      // Obtener fecha y hora en zona horaria de Guayaquil
      const fechaLocalString = now.toLocaleString('en-US', { timeZone: 'America/Guayaquil' });
      const [fechaStr, horaStr] = fechaLocalString.split(', ');
      const fechaParts = fechaStr.split('/');
      // Formatear fecha ISO YYYY-MM-DD
      const fechaISO = `${fechaParts[2]}-${fechaParts[0].padStart(2, '0')}-${fechaParts[1].padStart(2, '0')}`;

      // Función para convertir hora 12h AM/PM a 24h
      function convertTo24Hour(time12h) {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes, seconds] = time.split(':');

        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
      }

      ticket.solutionDate = fechaISO;
      ticket.solutionTime = convertTo24Hour(horaStr);
    } else {
      ticket.solutionDate = null;
      ticket.solutionTime = null;
    }

    await ticket.save();

    res.redirect('/tecnico');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al guardar la solución del ticket');
  }
};
