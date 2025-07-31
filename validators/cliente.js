const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateCliente = [
  check("ip")
    .exists().withMessage("La IP es requerida")
    .notEmpty().withMessage("La IP no puede estar vacía")
    .isIP().withMessage("Debe ser una dirección IP válida"),
    
  check("nombre")
    .exists().withMessage("El nombre es requerido")
    .notEmpty().withMessage("El nombre no puede estar vacío")
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
    
  check("apellido")
    .exists().withMessage("El apellido es requerido")
    .notEmpty().withMessage("El apellido no puede estar vacío")
    .isLength({ min: 3, max: 100 }).withMessage("El apellido debe tener entre 3 y 100 caracteres"),
    
  check("cedula")
    .exists().withMessage("La cédula es requerida")
    .notEmpty().withMessage("La cédula no puede estar vacía")
    .isLength({ min: 10, max: 13 }).withMessage("La cédula debe tener entre 10 y 13 caracteres"),
    
  check("correo")
    .exists().withMessage("El correo es requerido")
    .notEmpty().withMessage("El correo no puede estar vacío")
    .isEmail().withMessage("Debe ser un correo electrónico válido"),
    
  check("telefono1")
    .exists().withMessage("El teléfono principal es requerido")
    .notEmpty().withMessage("El teléfono principal no puede estar vacío")
    .isLength({ min: 7, max: 15 }).withMessage("El teléfono debe tener entre 7 y 15 caracteres"),
    
  check("telefono2")
    .optional()
    .isLength({ min: 7, max: 15 }).withMessage("El teléfono secundario debe tener entre 7 y 15 caracteres"),
    
  check("direccion")
    .exists().withMessage("La dirección es requerida")
    .notEmpty().withMessage("La dirección no puede estar vacía")
    .isLength({ min: 10, max: 255 }).withMessage("La dirección debe tener entre 10 y 255 caracteres"),
    
  check("parroquia")
    .exists().withMessage("La parroquia es requerida")
    .notEmpty().withMessage("La parroquia no puede estar vacía"),
    
  check("canton")
    .exists().withMessage("El cantón es requerido")
    .notEmpty().withMessage("El cantón no puede estar vacío"),
    
  check("ciudad")
    .exists().withMessage("La ciudad es requerida")
    .notEmpty().withMessage("La ciudad no puede estar vacía"),
    
  check("provincia")
    .exists().withMessage("La provincia es requerida")
    .notEmpty().withMessage("La provincia no puede estar vacía"),
    
  check("discapacidad")
    .exists().withMessage("El campo discapacidad es requerido")
    .notEmpty().withMessage("Debe especificar si tiene discapacidad"),
    
  check("id_plan")
    .exists().withMessage("El plan es requerido")
    .notEmpty().withMessage("Debe seleccionar un plan")
    .isInt().withMessage("El ID del plan debe ser un número entero"),
    
  check("fecha_contrato")
    .optional()
    .isISO8601().withMessage("La fecha de contrato debe tener un formato válido (YYYY-MM-DD)"),
    
  check("estado")
    .optional()
    .isIn(['Activo', 'Inactivo', 'Suspendido']).withMessage("El estado debe ser Activo, Inactivo o Suspendido"),
    
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validatorUpdateCliente = [
  check("ip")
    .optional()
    .isIP().withMessage("Debe ser una dirección IP válida"),
    
  check("nombre")
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),
    
  check("apellido")
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage("El apellido debe tener entre 3 y 100 caracteres"),
    
  check("cedula")
    .optional()
    .isLength({ min: 10, max: 13 }).withMessage("La cédula debe tener entre 10 y 13 caracteres"),
    
  check("correo")
    .optional()
    .isEmail().withMessage("Debe ser un correo electrónico válido"),
    
  check("telefono1")
    .optional()
    .isLength({ min: 7, max: 15 }).withMessage("El teléfono debe tener entre 7 y 15 caracteres"),
    
  check("telefono2")
    .optional()
    .isLength({ min: 7, max: 15 }).withMessage("El teléfono secundario debe tener entre 7 y 15 caracteres"),
    
  check("direccion")
    .optional()
    .isLength({ min: 10, max: 255 }).withMessage("La dirección debe tener entre 10 y 255 caracteres"),
    
  check("id_plan")
    .optional()
    .isInt().withMessage("El ID del plan debe ser un número entero"),
    
  check("fecha_contrato")
    .optional()
    .isISO8601().withMessage("La fecha de contrato debe tener un formato válido (YYYY-MM-DD)"),
    
  check("estado")
    .optional()
    .isIn(['Activo', 'Inactivo', 'Suspendido']).withMessage("El estado debe ser Activo, Inactivo o Suspendido"),
    
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validatorCreateCliente, validatorUpdateCliente };