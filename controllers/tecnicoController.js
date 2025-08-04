const Ticket = require('../models/mysql/Ticket');
const Client = require('../models/mysql/Cliente');
const User = require('../models/mysql/users');
const sequelize = require('../config/mysql');
const { Op } = require('sequelize');

module.exports = {
  index: async (req, res) => {
    try {
      const estadoFiltro = req.query.estado || '';
      const tecnicoId = req.user.id;

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

  resolverForm: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ]
      });
      if (!ticket) return res.status(404).send('Ticket no encontrado');

      res.render('tecnico/resolver', { ticket, user: req.user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el formulario de resolución');
    }
  },

  resolverTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const { solution, status, precio } = req.body;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) return res.status(404).send('Ticket no encontrado');

      ticket.solution = solution;
      ticket.status = status;
      ticket.precio = precio || null;

      if (status === 'cerrado' || status === 'completado') {
        const now = new Date();

        // Fecha en formato YYYY-MM-DD
        const fechaISO = now.toLocaleDateString('en-CA', {
          timeZone: 'America/Guayaquil'
        });

        // Hora en formato HH:mm:ss (24h)
        const hora24h = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Guayaquil',
          hour12: false
        }).format(now);

        ticket.solutionDate = fechaISO;
        ticket.solutionTime = hora24h;
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
}