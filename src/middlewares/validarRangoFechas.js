const AppError = require('../utils/AppError');

const esFechaISO = (valor) => {
    if (!valor || valor === '') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw new AppError('Formato de fecha inválido. Use YYYY-MM-DD', 400);
    }
    const fecha = new Date(`${valor}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) {
        throw new AppError('Fecha inválida', 400);
    }
    return valor;
};

const validarRangoFechas = (req, res, next) => {
    try {
        req.query.desde = esFechaISO(req.query.desde);
        req.query.hasta = esFechaISO(req.query.hasta);

        if (req.query.desde && req.query.hasta && req.query.desde > req.query.hasta) {
            throw new AppError('La fecha "desde" no puede ser posterior a "hasta"', 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validarRangoFechas;
