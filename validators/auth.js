const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorRegister = [
    check("name")
    .exists()
    .notEmpty()
    .isLength({min:3, max:99}),
    check("cedula")
    .exists()
    .notEmpty()
    .isLength({min:10, max:10}),
    check("telefono")
    .exists()
    .notEmpty()
    .isLength({min:10, max:10}),
    check("email")
    .exists()
    .notEmpty()
    .isEmail(),
    check("username")
    .exists()
    .notEmpty(),
    check("password")
    .exists()
    .notEmpty()
    .isLength({min:3, max:15}),
    check("role")
    .exists()
    .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorLogin = [
    check("password")
    .exists()
    .notEmpty()
    .isLength({min:3, max:15}),
    check("username")
    .exists()
    .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorRegister, validatorLogin};
