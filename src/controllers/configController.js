const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { getAllConfig, updateConfig } = require('../models/configModel');

const obtener = asyncHandler(async (req, res) => {
    const datos = await getAllConfig();
    sendSuccess(res, { mensaje: 'Configuración de la empresa', datos });
});

const actualizar = asyncHandler(async (req, res) => {
    const { precio_canasto, nombre_empresa, stock_minimo_default } = req.body;
    const updates = {};

    if (precio_canasto != null && precio_canasto !== '') {
        const precio = Number(precio_canasto);
        if (!precio || precio <= 0) {
            throw new AppError('El precio del canasto debe ser mayor a 0', 400);
        }
        updates.precio_canasto = precio;
    }

    if (nombre_empresa != null && nombre_empresa !== '') {
        updates.nombre_empresa = String(nombre_empresa).trim().slice(0, 120);
    }

    if (stock_minimo_default != null && stock_minimo_default !== '') {
        const minimo = Number(stock_minimo_default);
        if (minimo < 0) {
            throw new AppError('El stock mínimo por defecto no puede ser negativo', 400);
        }
        updates.stock_minimo_default = minimo;
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError('No hay cambios para guardar', 400);
    }

    const datos = await updateConfig(updates);
    sendSuccess(res, {
        mensaje: 'Configuración actualizada',
        datos
    });
});

module.exports = { obtener, actualizar };
