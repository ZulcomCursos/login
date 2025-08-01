const Ticket = require('../models/mysql/Ticket');
const Client = require('../models/mysql/Cliente');
const User = require('../models/mysql/users');
const sequelize = require('../config/mysql');
const { Op } = require('sequelize');

module.exports = {
  // Listar tickets asignados al técnico según el usuario logueado
  index: async (req, res) => {
    try {
      const estadoFiltro = req.query.estado || '';
      const tecnicoId = req.user.id;  // Id del técnico autenticado

      const whereCondition = { tecnicoId };
      if (estadoFiltro) {
        whereCondition.status = { [Op.eq]: estadoFiltro };
      }

      const tickets = await Ticket.findAll({
        where: whereCondition,
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.render('tecnico/index', {
        tickets,
        estadoSeleccionado: estadoFiltro,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los tickets del técnico');
    }
  },

  // Mostrar formulario para resolver ticket
  resolverForm: async (req, res) => {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ]
      });

      if (!ticket) {
        return res.status(404).send('Ticket no encontrado');
      }

      res.render('tecnico/resolver', { 
        ticket,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el formulario de resolución');
    }
  },

  // Procesar solución enviada por técnico
  resolverTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const { solution, status } = req.body;

      const ticket = await Ticket.findByPk(id);

      if (!ticket) {
        return res.status(404).send('Ticket no encontrado');
      }

      ticket.solution = solution;
      ticket.status = status;

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
  }
};
