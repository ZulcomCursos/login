const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorRegister = [
    check("name")
        .exists().withMessage("El nombre es requerido")
        .notEmpty().withMessage("El nombre no puede estar vacío")
        .isLength({min:3, max:99}).withMessage("El nombre debe tener entre 3 y 99 caracteres"),
    check("cedula")
        .exists().withMessage("La cédula es requerida")
        .notEmpty().withMessage("La cédula no puede estar vacía")
        .isLength({min:10, max:10}).withMessage("La cédula debe tener 10 caracteres"),
    check("telefono")
        .exists().withMessage("El teléfono es requerido")
        .notEmpty().withMessage("El teléfono no puede estar vacío")
        .isLength({min:10, max:10}).withMessage("El teléfono debe tener 10 caracteres"),
    check("email")
        .exists().withMessage("El email es requerido")
        .notEmpty().withMessage("El email no puede estar vacío")
        .isEmail().withMessage("Debe ser un email válido"),
    check("username")
        .exists().withMessage("El nombre de usuario es requerido")
        .notEmpty().withMessage("El nombre de usuario no puede estar vacío"),
    check("password")
        .exists().withMessage("La contraseña es requerida")
        .notEmpty().withMessage("La contraseña no puede estar vacía")
        .isLength({min:3, max:15}).withMessage("La contraseña debe tener entre 3 y 15 caracteres"),
    check("role")
        .exists().withMessage("El rol es requerido")
        .notEmpty().withMessage("Debe seleccionar un rol"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
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