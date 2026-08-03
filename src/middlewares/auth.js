const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            exito: false,
            mensaje: 'No llegó Authorization'
        });
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
            exito: false,
            mensaje: 'Formato incorrecto. Use Bearer token'
        });
    }

    const token = partes[1];

    try {
        const usuario = jwt.verify(token, jwtConfig.secret);
        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            exito: false,
            mensaje: 'Token inválido'
        });
    }
};

module.exports = auth;
