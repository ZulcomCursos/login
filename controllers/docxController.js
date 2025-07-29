const { format } = require('date-fns');
const { es } = require('date-fns/locale');
const fs = require('fs');
const path = require('path');
const docxTemplates = require('docx-templates');
const Cliente = require('../models/mysql/Cliente');
const Plan = require('../models/mysql/Plan');

exports.generateContract = async (req, res) => {
  try {
    const id = req.params.id;

    // Obtener datos del cliente usando Sequelize
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).send('Cliente no encontrado');
    }

    // Obtener datos del plan
    const plan = await Plan.findByPk(cliente.id_plan);
    if (!plan) {
      return res.status(404).send('Plan no encontrado');
    }

    const costo = Number(plan.costo);

    // Formatear fechas
    const now = new Date();
    const fecha = format(now, 'dd/MM/yyyy');
    const fecha1 = format(now, "d 'de' MMMM 'del' yyyy", { locale: es });
    const hora = format(now, 'HH:mm');

    // Ruta de la plantilla y del DOCX resultante
    const templatePath = path.join(__dirname, '../templates/contrato_template.docx');
    const downloadsPath = require('os').homedir() + '/Downloads';
    const outputFileName = `Contrato_${cliente.nombre}_${cliente.apellido}_${cliente.cedula}.docx`;
    const outputPath = path.join(downloadsPath, outputFileName);

    // Datos para reemplazar en la plantilla
    const replacements = {
      fecha1,
      fecha,
      hora,
      apellido: cliente.apellido,
      nombre: cliente.nombre,
      cedula: cliente.cedula,
      correo: cliente.correo,
      telefono1: cliente.telefono1,
      telefono2: cliente.telefono2 || 'N/A',
      direccion: cliente.direccion,
      coordenadas: cliente.coordenadas || 'N/A',
      parroquia: cliente.parroquia,
      canton: cliente.canton,
      ciudad: cliente.ciudad,
      provincia: cliente.provincia,
      si_x: cliente.discapacidad === 'si' ? '' : '___',
      si__: cliente.discapacidad === 'si' ? '_X_' : '',
      no_x: cliente.discapacidad === 'no' ? '' : '___',
      no__: cliente.discapacidad === 'no' ? '_X_' : '',
      referencias: cliente.referencias || 'N/A',
      plan_contratar: plan.nombre_plan,
      plan: `${plan.megas} Mbps`,
      costo: `$${costo.toFixed(2)}`
    };

    // Generar DOCX desde la plantilla
    const template = fs.readFileSync(templatePath);
    const buffer = await docxTemplates.createReport({
      template,
      data: replacements,
      cmdDelimiter: ['[', ']']
    });

    // Guardar el archivo DOCX
    fs.writeFileSync(outputPath, buffer);

    // Descargar el archivo
    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Error al descargar el contrato:', err);
        res.status(500).send('Error al descargar el contrato');
      }
      // Si quieres eliminar el archivo después de descargarlo, descomenta la siguiente línea:
      // fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error al generar el contrato:', error);
    res.status(500).send('Error al generar el contrato: ' + error.message);
  }
};
