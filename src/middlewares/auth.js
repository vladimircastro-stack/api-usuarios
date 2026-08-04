const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const { buscarUsuarioPorId } = require('../models/usuariosModel');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('No llegó Authorization', 401);
        }

        const partes = authHeader.split(' ');

        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            throw new AppError('Formato incorrecto. Use Bearer token', 401);
        }

        const token = partes[1];
        const decoded = jwt.verify(token, jwtConfig.secret);
        const usuario = await buscarUsuarioPorId(decoded.id);

        if (!usuario) {
            throw new AppError('Usuario no encontrado o inactivo', 401);
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError('Token inválido', 401));
    }
};

module.exports = auth;
