const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorRegister = [
  check("cedula")
    .exists().withMessage("La cédula es requerida")
    .notEmpty().withMessage("La cédula no puede estar vacía")
    .isLength({min:10, max:10}).withMessage("La cédula debe tener 10 caracteres")
    .isNumeric().withMessage("La cédula debe contener solo números"),
  check("telefono")
    .exists().withMessage("El teléfono es requerido")
    .notEmpty().withMessage("El teléfono no puede estar vacío")
    .isLength({min:10, max:10}).withMessage("El teléfono debe tener 10 caracteres")
    .isNumeric().withMessage("El teléfono debe contener solo números"),
  check("domicilio")
    .exists().withMessage("La dirección es requerida")
    .notEmpty().withMessage("La dirección no puede estar vacía")
    .isLength({min:3, max:150}).withMessage("La dirección debe tener mas de 3 caracteres"),
  check("nombres")
    .exists().withMessage("Los nombres son requeridos")
    .notEmpty().withMessage("Los nombres no pueden estar vacios")
    .isLength({min:3, max:99}).withMessage("Los nombres deben tener mas de 3 caracteres"),
  check("apellidos")
    .exists().withMessage("Los apellidos son requeridos")
    .notEmpty().withMessage("Los apellidos no pueden estar vacios")
    .isLength({min:3, max:99}).withMessage("Los apellidos deben tener mas de 3 caracteres"),
  check("email")
    .exists().withMessage("El email es requerido")
    .notEmpty().withMessage("El email no puede estar vacío")
    .isEmail().withMessage("Debe ser un email válido"),
  check("role")
    .exists().withMessage("El rol es requerido")
    .notEmpty().withMessage("Debe seleccionar un rol"),
 check("copia_cedula")
  .custom((value, { req }) => {
    if (!req.files || !req.files['copia_cedula']) {
      throw new Error('La copia de cédula es requerida');
    }
    if (req.files['copia_cedula'][0].mimetype !== 'application/pdf') {
      throw new Error('La copia de cédula debe ser un PDF');
    }
    return true;
  }),
check("record_policial")
  .custom((value, { req }) => {
    if (!req.files || !req.files['record_policial']) {
      throw new Error('El record policial es requerido');
    }
    if (req.files['record_policial'][0].mimetype !== 'application/pdf') {
      throw new Error('El record policial debe ser un PDF');
    }
    return true;
  }),
];

const validatorLogin = [
    check("password")
        .exists().withMessage("La contraseña es requerida")
        .notEmpty().withMessage("La contraseña no puede estar vacía")
        .isLength({min:3, max:15}).withMessage("La contraseña debe tener entre 3 y 15 caracteres"),
    check("username")
        .exists().withMessage("El nombre de usuario es requerido")
        .notEmpty().withMessage("El nombre de usuario no puede estar vacío"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorRegister, validatorLogin };