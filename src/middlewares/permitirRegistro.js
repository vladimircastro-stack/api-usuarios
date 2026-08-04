const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('./auth');
const verificarRol = require('./rol');
const { contarUsuarios } = require('../models/usuariosModel');

const permitirRegistro = asyncHandler(async (req, res, next) => {
    const total = await contarUsuarios();

    if (total === 0) {
        return next();
    }

    if (process.env.ALLOW_PUBLIC_REGISTER === 'true') {
        return next();
    }

    return auth(req, res, () => verificarRol('admin')(req, res, next));
});

module.exports = permitirRegistro;
