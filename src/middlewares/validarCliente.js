const AppError = require('../utils/AppError');
const { esCorreoValido, normalizarCorreo, normalizarTexto } = require('../utils/validators');

const validarCliente = (req, res, next) => {
    const { nombre, telefono, correo, direccion } = req.body || {};

    if (!nombre || normalizarTexto(nombre) === '') {
        return next(new AppError('El nombre del cliente es obligatorio', 400));
    }

    if (correo && !esCorreoValido(correo)) {
        return next(new AppError('El correo no tiene un formato válido', 400));
    }

    req.body.nombre = normalizarTexto(nombre);
    req.body.telefono = telefono ? normalizarTexto(telefono) : null;
    req.body.correo = correo ? normalizarCorreo(correo) : null;
    req.body.direccion = direccion ? normalizarTexto(direccion) : null;

    return next();
};

module.exports = validarCliente;
