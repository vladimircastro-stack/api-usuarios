const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');
const {
    obtenerMovimientos,
    obtenerBajoStock,
    ajustarInventario,
    resumenInventario
} = require('../models/inventarioModel');

const listarMovimientos = asyncHandler(async (req, res) => {
    const limite = Math.min(Number(req.query.limite) || 50, 200);
    const movimientos = await obtenerMovimientos(limite);
    sendSuccess(res, { mensaje: 'Movimientos obtenidos', datos: movimientos });
});

const listarBajoStock = asyncHandler(async (req, res) => {
    const productos = await obtenerBajoStock();
    sendSuccess(res, { mensaje: 'Productos con bajo stock', datos: productos });
});

const ajustar = asyncHandler(async (req, res) => {
    const { cantidad, referencia } = req.body;
    const productoId = req.params.id;

    if (cantidad == null || Number.isNaN(Number(cantidad)) || Number(cantidad) < 0) {
        throw new AppError('La cantidad debe ser un número mayor o igual a 0', 400);
    }

    try {
        const resultado = await ajustarInventario(
            productoId,
            Number(cantidad),
            referencia,
            req.usuario.id
        );
        sendSuccess(res, { mensaje: 'Inventario ajustado', datos: resultado });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            throw new AppError('Producto no encontrado', 404);
        }
        throw error;
    }
});

const resumen = asyncHandler(async (req, res) => {
    const data = await resumenInventario();
    sendSuccess(res, { mensaje: 'Resumen de inventario', datos: data });
});

module.exports = {
    listarMovimientos,
    listarBajoStock,
    ajustar,
    resumen
};
