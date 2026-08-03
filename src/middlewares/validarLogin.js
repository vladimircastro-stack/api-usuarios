const AppError = require('../utils/AppError');
const { esCorreoValido, normalizarCorreo } = require('../utils/validators');

const validarLogin = (req, res, next) => {
    const { correo, password } = req.body || {};

    if (!correo || !password) {
        return next(new AppError('Correo y contraseña son obligatorios', 400));
    }

    if (!esCorreoValido(correo)) {
        return next(new AppError('El correo no tiene un formato válido', 400));
    }

    req.body.correo = normalizarCorreo(correo);
    return next();
};

module.exports = validarLogin;
