const AppError = require('../utils/AppError');
const {
    esCorreoValido,
    esEnteroPositivo,
    normalizarCorreo,
    normalizarTexto
} = require('../utils/validators');

const validarActualizarUsuario = (req, res, next) => {
    const { nombre, correo, edad, password } = req.body || {};

    if (!nombre || !correo || edad === undefined || edad === null || edad === '') {
        return next(new AppError('Nombre, correo y edad son obligatorios', 400));
    }

    if (normalizarTexto(nombre).length < 3) {
        return next(new AppError('El nombre debe tener mínimo 3 caracteres', 400));
    }

    if (!esCorreoValido(correo)) {
        return next(new AppError('El correo no tiene un formato válido', 400));
    }

    if (Number.isNaN(Number(edad)) || !Number.isInteger(Number(edad))) {
        return next(new AppError('La edad debe ser un número entero', 400));
    }

    if (edad < 1 || edad > 120) {
        return next(new AppError('La edad debe estar entre 1 y 120 años', 400));
    }

    if (password !== undefined && password !== null && password !== '' && password.length < 6) {
        return next(new AppError('La contraseña debe tener mínimo 6 caracteres', 400));
    }

    req.body.nombre = normalizarTexto(nombre);
    req.body.correo = normalizarCorreo(correo);
    req.body.edad = Number(edad);

    return next();
};

module.exports = validarActualizarUsuario;
