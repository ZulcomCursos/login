const Ticket = require('../models/mysql/Ticket');
const Client = require('../models/mysql/Cliente');
const User = require('../models/mysql/users');
const sequelize = require('../config/mysql');
const { Op, col, fn, where } = require('sequelize');


module.exports = {
  index: async (req, res) => {
    try {
      const estadoFiltro = req.query.estado || '';
      const tecnicoFiltro = req.query.tecnico || '';
      const problemaFiltro = req.query.problema || '';
      const fechaInicio = req.query.fechaInicio || '';
      const fechaFin = req.query.fechaFin || '';

      let whereCondition = {};

      if (estadoFiltro) {
        whereCondition.status = estadoFiltro;
      }

      if (tecnicoFiltro) {
        whereCondition.tecnicoId = tecnicoFiltro;
      }

      if (problemaFiltro) {
        whereCondition.issueType = { [Op.like]: `%${problemaFiltro}%` };
      }

      if (fechaInicio && fechaFin) {
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        end.setHours(23, 59, 59, 999);

        whereCondition.createdAt = {
          [Op.between]: [start, end]
        };
      } else if (fechaInicio) {
        const start = new Date(fechaInicio);
        const end = new Date(fechaInicio);
        end.setHours(23, 59, 59, 999);

        whereCondition.createdAt = {
          [Op.between]: [start, end]
        };
      }

      const tickets = await Ticket.findAll({
        where: whereCondition,
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Aquí uso role con mayúscula y atributos nombres y apellidos
      const tecnicos = await User.findAll({
        where: { role: 'Tecnico' },
        attributes: ['id', 'nombres', 'apellidos']
      });

      // Arreglo con tipos de problema disponibles:
      const tiposProblema = [
        'Hardware',
        'Software',
        'Red',
        'Facturación',
        'Otro'
      ];

      res.render('tickets/index', {
        tickets,
        tecnicos,
        estadoSeleccionado: estadoFiltro,
        tecnicoSeleccionado: tecnicoFiltro,
        problemaSeleccionado: problemaFiltro,
        fechaInicio,
        fechaFin,
        tiposProblema,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los tickets');
    }
  },

  create: async (req, res) => {
    try {
      const tecnicos = await User.findAll({
        where: { role: 'Tecnico' },
        attributes: ['id', 'nombres', 'apellidos', 'email']
      });

      res.render('tickets/create', { tecnicos, user: req.user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el formulario');
    }
  },

  searchClient: async (req, res) => {
    try {
      const { cedula } = req.query;
      if (!cedula) return res.status(400).json({ error: 'Cédula no proporcionada' });

      const client = await Client.findOne({ where: { cedula } });
      if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

      res.json(client);
    } catch (error) {
      console.error('Error en búsqueda por cédula:', error);
      res.status(500).json({ error: 'Error en la búsqueda' });
    }
  },

   store: async (req, res) => {
    try {
      const { clientId, issueType, description, priority, tecnicoId, horaVisita } = req.body;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      // Usa helpers correctos
      const lastTicket = await Ticket.findOne({
        where: where(
          fn('DATE', col('fecha_creacion')),
          fn('CURDATE')
        ),
        order: [['fecha_creacion', 'DESC']]
      });

      let ticketNumber;
      if (lastTicket) {
        const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[1]) || 0;
        ticketNumber = `${year}${month}${day}-${lastNumber + 1}`;
      } else {
        ticketNumber = `${year}${month}${day}-1`;
      }

      const newTicket = await Ticket.create({
        ticketNumber,
        issueType,
        description,
        priority,
        clientId,
        tecnicoId,
        horaVisita,
        status: 'abierto'
      });

      res.redirect(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al crear el ticket');
    }
  },

  show: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ]
      });

      if (!ticket) return res.status(404).send('Ticket no encontrado');
      res.render('tickets/show', { ticket, user: req.user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener el ticket');
    }
  },

  edit: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'tecnico' }
        ]
      });

      if (!ticket) return res.status(404).send('Ticket no encontrado');

      const tecnicos = await User.findAll({
        where: { role: 'Tecnico' },
        attributes: ['id', 'nombres', 'apellidos', 'email']
      });

      res.render('tickets/edit', {
        ticket,
        tecnicos,
        isEdit: true,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al cargar el formulario de edición');
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { issueType, description, priority, status, tecnicoId, solution, horaVisita } = req.body;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) return res.status(404).send('Ticket no encontrado');

      ticket.issueType = issueType;
      ticket.description = description;
      ticket.priority = priority;
      ticket.status = status;
      ticket.tecnicoId = tecnicoId || ticket.tecnicoId;
      ticket.solution = solution || ticket.solution;
      ticket.horaVisita = horaVisita || ticket.horaVisita; // NUEVO

      if (status === 'cerrado' || status === 'completado') {
        const now = new Date();
        ticket.solutionDate = now;
        ticket.solutionTime = now.toTimeString().split(' ')[0];
      } else {
        ticket.solutionDate = null;
        ticket.solutionTime = null;
      }

      await ticket.save();
      res.redirect(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al actualizar el ticket');
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ticket = await Ticket.findByPk(id);
      if (!ticket) return res.status(404).send('Ticket no encontrado');

      ticket.status = status;

      if (status === 'cerrado' || status === 'completado') {
        const now = new Date();
        ticket.solutionDate = now;
        ticket.solutionTime = now.toTimeString().split(' ')[0];
      } else {
        ticket.solutionDate = null;
        ticket.solutionTime = null;
      }

      await ticket.save();
      res.redirect('/tickets');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al actualizar el estado del ticket');
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findByPk(id);
      if (!ticket) return res.status(404).send('Ticket no encontrado');

      await ticket.destroy();
      res.redirect('/tickets');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al eliminar el ticket');
    }
  }
};
