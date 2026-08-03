const AppError = require('../utils/AppError');
const { esEnteroPositivo, esNumeroPositivo } = require('../utils/validators');

const validarVenta = (req, res, next) => {
    const { cliente_id, productos } = req.body || {};

    if (!esEnteroPositivo(cliente_id)) {
        return next(new AppError('cliente_id debe ser un número entero positivo', 400));
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        return next(new AppError('Debe incluir al menos un producto en la venta', 400));
    }

    for (const [index, producto] of productos.entries()) {
        if (!producto || !esEnteroPositivo(producto.producto_id)) {
            return next(new AppError(`productos[${index}].producto_id es inválido`, 400));
        }

        if (!esNumeroPositivo(producto.cantidad)) {
            return next(new AppError(`productos[${index}].cantidad debe ser mayor a 0`, 400));
        }
    }

    req.body.cliente_id = Number(cliente_id);
    return next();
};

module.exports = validarVenta;
