const AppError = require('../utils/AppError');

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error('ERROR DEL SERVIDOR:', error);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            exito: false,
            mensaje: error.message
        });
    }

    if (error.code === '23505') {
        return res.status(400).json({
            exito: false,
            mensaje: 'El dato ya existe en la base de datos'
        });
    }

    if (error.code === '23502') {
        return res.status(400).json({
            exito: false,
            mensaje: 'Faltan datos obligatorios'
        });
    }

    if (error.code === '23503') {
        return res.status(400).json({
            exito: false,
            mensaje: 'No se puede realizar esta acción porque existe una relación con otros datos'
        });
    }

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            exito: false,
            mensaje: 'El formato JSON enviado no es válido'
        });
    }

    return res.status(500).json({
        exito: false,
        mensaje: 'Ocurrió un error interno en el servidor'
    });
};

module.exports = errorHandler;
