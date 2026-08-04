const AppError = require('../utils/AppError');
const { esEnteroPositivo, esNumeroPositivo, esNumeroNoNegativo } = require('../utils/validators');

const validarVenta = (req, res, next) => {
    const {
        cliente_id,
        productos,
        fecha_entrega_programada,
        notas_entrega,
        canastos_entregados,
        tipo_pago
    } = req.body || {};

    if (!esEnteroPositivo(cliente_id)) {
        return next(new AppError('cliente_id debe ser un número entero positivo', 400));
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        return next(new AppError('Debe incluir al menos un producto en la venta', 400));
    }

    if (productos.length > 50) {
        return next(new AppError('Demasiados productos en una sola venta', 400));
    }

    for (const [index, producto] of productos.entries()) {
        if (!producto || !esEnteroPositivo(producto.producto_id)) {
            return next(new AppError(`productos[${index}].producto_id es inválido`, 400));
        }

        if (!esNumeroPositivo(producto.cantidad)) {
            return next(new AppError(`productos[${index}].cantidad debe ser mayor a 0`, 400));
        }

        if (!esNumeroPositivo(producto.precio)) {
            return next(new AppError(`productos[${index}].precio es obligatorio y debe ser mayor a 0`, 400));
        }

        if (producto.cantidad_inventario != null && !esNumeroPositivo(producto.cantidad_inventario)) {
            return next(new AppError(`productos[${index}].cantidad_inventario inválida`, 400));
        }

        if (producto.descripcion && String(producto.descripcion).length > 200) {
            return next(new AppError(`productos[${index}].descripcion muy larga`, 400));
        }

        if (producto.unidad_venta && String(producto.unidad_venta).length > 40) {
            return next(new AppError(`productos[${index}].unidad_venta inválida`, 400));
        }
    }

    if (notas_entrega != null && String(notas_entrega).length > 500) {
        return next(new AppError('Las notas de entrega no pueden superar 500 caracteres', 400));
    }

    if (canastos_entregados != null && !esNumeroNoNegativo(canastos_entregados)) {
        return next(new AppError('canastos_entregados inválido', 400));
    }

    if (tipo_pago != null && !['contado', 'credito'].includes(tipo_pago)) {
        return next(new AppError('tipo_pago debe ser contado o credito', 400));
    }

    req.body.tipo_pago = tipo_pago === 'credito' ? 'credito' : 'contado';

    if (fecha_entrega_programada != null && fecha_entrega_programada !== '') {
        const fecha = new Date(fecha_entrega_programada);
        if (Number.isNaN(fecha.getTime())) {
            return next(new AppError('fecha_entrega_programada no es válida', 400));
        }
    }

    req.body.cliente_id = Number(cliente_id);
    return next();
};

module.exports = validarVenta;
