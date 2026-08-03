const AppError = require('../utils/AppError');
const { esEnteroPositivo } = require('../utils/validators');

const validarId = (req, res, next) => {
    const { id } = req.params;

    if (!esEnteroPositivo(id)) {
        return next(new AppError('El ID debe ser un número entero positivo', 400));
    }

    req.params.id = String(Number(id));
    return next();
};

module.exports = validarId;
