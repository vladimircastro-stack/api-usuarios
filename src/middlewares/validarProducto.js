const AppError = require('../utils/AppError');
const {
    esNumeroNoNegativo,
    esNumeroPositivo,
    normalizarTexto
} = require('../utils/validators');

const validarProducto = (req, res, next) => {
    const {
        nombre,
        categoria,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta,
        stock_minimo,
        activo
    } = req.body || {};

    if (!nombre || normalizarTexto(nombre) === '') {
        return next(new AppError('El nombre del producto es obligatorio', 400));
    }

    if (!categoria || normalizarTexto(categoria) === '') {
        return next(new AppError('La categoría es obligatoria', 400));
    }

    if (!unidad_medida || normalizarTexto(unidad_medida) === '') {
        return next(new AppError('La unidad de medida es obligatoria', 400));
    }

    if (cantidad == null || !esNumeroNoNegativo(cantidad)) {
        return next(new AppError('Cantidad inválida', 400));
    }

    if (precio_compra == null || !esNumeroPositivo(precio_compra)) {
        return next(new AppError('Precio de compra inválido', 400));
    }

    if (precio_venta == null || !esNumeroPositivo(precio_venta)) {
        return next(new AppError('Precio de venta inválido', 400));
    }

    req.body.nombre = normalizarTexto(nombre);
    req.body.categoria = normalizarTexto(categoria);
    req.body.unidad_medida = normalizarTexto(unidad_medida);

    if (stock_minimo != null && !esNumeroNoNegativo(stock_minimo)) {
        return next(new AppError('Stock mínimo inválido', 400));
    }

    if (activo != null && typeof activo !== 'boolean') {
        return next(new AppError('El campo activo debe ser booleano', 400));
    }

    return next();
};

module.exports = validarProducto;
