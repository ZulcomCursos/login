const Ticket = require('../models/mysql/Ticket');
const Client = require('../models/mysql/Cliente');
const User = require('../models/mysql/users');
const sequelize = require('../config/mysql');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ------------------------- FUNCIONES -------------------------

const index = async (req, res) => {
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
};

const resolverForm = async (req, res) => {
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
};

const resolverTicket = async (req, res) => {
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

      const fechaISO = now.toLocaleDateString('en-CA', {
        timeZone: 'America/Guayaquil'
      });

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
};

const generarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const tecnicoId = req.user.id;

    const ticket = await Ticket.findOne({
      where: { id, tecnicoId },
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'tecnico' }
      ]
    });

    if (!ticket) {
      return res.status(404).send('Ticket no encontrado o no pertenece a este técnico');
    }

    const fileDir = path.join(__dirname, '..', 'public', 'pdf');
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    const fileName = `Ticket_${ticket.ticketNumber}_${Date.now()}.pdf`;
    const filePath = path.join(fileDir, fileName);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ---------- Fondo blanco ----------
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    
    // ---------- Cabecera tipo ticket ----------
    doc
      .fillColor('#5c6ac4')
      .rect(30, 30, doc.page.width - 60, 50)
      .fill('#5c6ac4');

    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`TICKET #${ticket.ticketNumber}`, 40, 45, { align: 'center' });

    doc.moveDown(2);

    // ---------- Sección de información ----------
    const startY = 100;
    doc.fillColor('#364467').fontSize(12).font('Helvetica-Bold');
    doc.text('Cliente:', 40, startY);
    doc.font('Helvetica').text(ticket.client ? `${ticket.client.nombre} ${ticket.client.apellido}` : 'Sin cliente', 150, startY);

    doc.font('Helvetica-Bold').text('Cédula:', 40, startY + 20);
    doc.font('Helvetica').text(ticket.client?.cedula || '-', 150, startY + 20);

    doc.font('Helvetica-Bold').text('IP:', 40, startY + 40);
    doc.font('Helvetica').text(ticket.client?.ip || '-', 150, startY + 40);

    doc.font('Helvetica-Bold').text('Teléfono:', 40, startY + 60);
    doc.font('Helvetica').text(ticket.client?.telefono1 || '-', 150, startY + 60);

    doc.font('Helvetica-Bold').text('Dirección:', 40, startY + 80);
    doc.font('Helvetica').text(ticket.client?.direccion || '-', 150, startY + 80);

    doc.font('Helvetica-Bold').text('Referencia:', 40, startY + 100);
    doc.font('Helvetica').text(ticket.client?.referencias || '-', 150, startY + 100);

    doc.font('Helvetica-Bold').text('Técnico:', 40, startY + 120);
    doc.font('Helvetica').text(ticket.tecnico ? `${ticket.tecnico.nombres} ${ticket.tecnico.apellidos}` : '-', 150, startY + 120);

    // ---------- Sección problema ----------
    doc.moveDown(7);
    doc.rect(30, startY + 160, doc.page.width - 60, 120)
       .fill('#eef1ff'); // color azul claro de fondo
    doc.fillColor('#3c50e8').fontSize(14).font('Helvetica-Bold');
    doc.text(`Problema: ${ticket.issueType}`, 40, startY + 170);
    doc.fillColor('#364467').font('Helvetica').fontSize(12);
    doc.text(`Descripción: ${ticket.description}`, 40, startY + 190, { width: doc.page.width - 80 });

    // ---------- Estado y solución ----------
    doc.fillColor('#5c6ac4').font('Helvetica-Bold');
    doc.text(`Estado: ${ticket.status}`, 40, startY + 310);
    doc.text(`Hora de visita: ${ticket.horaVisita || '-'}`, 200, startY + 310);
    doc.text(`Precio: ${ticket.precio || '-'}`, 40, startY + 330);
    doc.text(`Solución: ${ticket.solution || '-'}`, 200, startY + 330);

    // ---------- Pie de página ----------
    doc.fillColor('#999999').fontSize(10).text('Gracias por confiar en nuestro servicio', 40, doc.page.height - 50, { align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      res.download(filePath, fileName);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al generar PDF');
  }
}
const verInformacion = async (req, res) => {
  try {
    const { id } = req.params;
    const tecnicoId = req.user.id;

    const ticket = await Ticket.findOne({
      where: { id, tecnicoId },
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'tecnico' }
      ]
    });

    if (!ticket) {
      return res.status(404).send('Ticket no encontrado o no pertenece a este técnico');
    }

    res.render('tecnico/ver', { ticket, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al mostrar la información del ticket');
  }
};




// ------------------------- EXPORTAR -------------------------

module.exports = {
  index,
  resolverForm,
  resolverTicket,
  generarPDF,
  verInformacion
};
