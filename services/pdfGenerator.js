const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function toNumber(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

const generarPDFColaborador = async (res, colaborador, roles, id) => {
  if (!roles || roles.length === 0) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rol_pago_${id}.pdf`);
    doc.pipe(res);
    doc.fontSize(18).text('No hay roles de pago disponibles para este colaborador.', 50, 150);
    doc.end();
    return;
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Nombre completo desde colaborador
  const nombreCompleto = `${colaborador.nombres} ${colaborador.apellidos}`;

  const fechaCreacion = new Date().toLocaleString('es-EC', {
  dateStyle: 'short',
  timeStyle: 'short'
});

  // Datos desde colaborador
  const cedula = colaborador.cedula || 'N/A';
  const cargo = colaborador.cargo || 'N/A';

  // Fecha ingreso (si está en colaborador, sino 'N/A')
  const fechaIngreso = colaborador.fecha_ingreso
    ? new Date(colaborador.fecha_ingreso).toLocaleDateString('es-EC')
    : 'N/A';

  const moradoLogo = '#443fcc';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=rol_pago_${id}.pdf`);
  doc.pipe(res);

  // Logo
  const logoPath = path.join(__dirname, '../img/logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  // Encabezado
  doc
    .fillColor(moradoLogo)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Zulcom Solutions S.A.', 120, 55);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('RUC: 0999999999001', 120, 80);

  doc
    .fontSize(16)
    .fillColor(moradoLogo)
    .font('Helvetica-Bold')
    .text('COMPROBANTE DE PAGO', { align: 'right' });

  doc
    .moveTo(50, 110)
    .lineTo(545, 110)
    .lineWidth(2)
    .strokeColor(moradoLogo)
    .stroke();

  // Datos colaborador
  doc
    .fontSize(11)
    .fillColor('black')
    .font('Helvetica')
    .text(`Colaborador: ${nombreCompleto}`, 50, 120)
    .text(`Cédula: ${cedula}`, 50, 140)
    .text(`Cargo: ${cargo}`, 300, 120)
    .text(`Fecha de Ingreso: ${fechaIngreso}`, 300, 140)
    .text(`Fecha de Creación: ${fechaCreacion}`, 50, 160);

  // Tabla con rol[0]
  let startY = 190;
  const rol = roles[0];
  const salario = toNumber(rol.salario);
  const horasExtra = toNumber(rol.horas_extra);
  const bonos = toNumber(rol.bonos);
  const descuentos = toNumber(rol.descuentos);
  const aporteIess = toNumber(rol.aporte_iess);
  const total = toNumber(rol.total);

  const tableX = 50;
  const colWidth = 220;
  const rowHeight = 20;
  const gapBetweenCols = 50;

  // Encabezados columnas
  doc
    .fontSize(13)
    .fillColor(moradoLogo)
    .font('Helvetica-Bold')
    .text('HABERES', tableX, startY);

  doc
    .text('DESCUENTOS', tableX + colWidth + gapBetweenCols, startY);

  startY += 25;

  doc
    .fontSize(11)
    .fillColor('black')
    .font('Helvetica');

  // Haberes
  doc.text('Salario Básico:', tableX, startY);
  doc.text(`$${salario.toFixed(2)}`, tableX + 130, startY, { width: 80, align: 'right' });
  startY += rowHeight;

  doc.text('Horas Extra:', tableX, startY);
  doc.text(`${horasExtra}`, tableX + 130, startY, { width: 80, align: 'right' });
  startY += rowHeight;

  doc.text('Bonos:', tableX, startY);
  doc.text(`$${bonos.toFixed(2)}`, tableX + 130, startY, { width: 80, align: 'right' });

  // Descuentos
  let descY = startY - (2 * rowHeight);

  doc.text('Descuentos:', tableX + colWidth + gapBetweenCols, descY);
  doc.text(`$${descuentos.toFixed(2)}`, tableX + colWidth + gapBetweenCols + 130, descY, { width: 80, align: 'right' });
  descY += rowHeight;

  doc.text('Aporte IESS:', tableX + colWidth + gapBetweenCols, descY);
  doc.text(`$${aporteIess.toFixed(2)}`, tableX + colWidth + gapBetweenCols + 130, descY, { width: 80, align: 'right' });

  // Total neto
  startY += 50;
  doc
    .fontSize(14)
    .fillColor(moradoLogo)
    .font('Helvetica-Bold')
    .text(`TOTAL A PAGAR: $${total.toFixed(2)}`, tableX, startY);

  // Cuadro confirmación y texto legal
  startY += 40;
  doc
    .lineWidth(1)
    .strokeColor(moradoLogo)
    .rect(tableX, startY, 495, 60)
    .stroke();

  doc
    .fontSize(9)
    .fillColor('black')
    .font('Helvetica')
    .text(
      'Declaro haber recibido conforme el pago correspondiente al periodo indicado, de acuerdo con la legislación laboral vigente.',
      tableX + 10,
      startY + 10,
      { width: 475 }
    );

  // Firmas
  startY += 140;
  doc
    .moveTo(tableX, startY)
    .lineTo(tableX + 200, startY)
    .stroke();

  doc.text('Firma Empleado', tableX, startY + 5);

  doc
    .moveTo(tableX + 300, startY)
    .lineTo(tableX + 495, startY)
    .stroke();

  doc.text('Firma Gerente', tableX + 300, startY + 5);

  doc.end();
};

module.exports = { generarPDFColaborador };
