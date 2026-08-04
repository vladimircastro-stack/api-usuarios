const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const pool = require('../db');
const {
    obtenerEntregas,
    actualizarEstadoEntrega,
    buscarVentaPorId
} = require('../models/ventasModel');
const { revertirVentaCancelada } = require('../services/revertirVentaService');

const ESTADOS_VALIDOS = ['pendiente', 'en_ruta', 'entregada', 'cancelada'];

const listarEntregas = asyncHandler(async (req, res) => {
    const { estado, hoy } = req.query;

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        throw new AppError('Estado de entrega inválido', 400);
    }

    const entregas = await obtenerEntregas(estado, { hoy: hoy === '1' || hoy === 'true' });
    sendSuccess(res, { mensaje: 'Entregas obtenidas', datos: entregas });
});

const actualizarEntrega = asyncHandler(async (req, res) => {
    const { estado, notas_entrega, fecha_entrega_programada } = req.body;
    const ventaId = req.params.id;

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        throw new AppError('Estado de entrega inválido', 400);
    }

    const ventaActual = await buscarVentaPorId(ventaId);
    if (!ventaActual.venta) {
        throw new AppError('Venta no encontrada', 404);
    }

    const estadoAnterior = ventaActual.venta.estado_entrega || 'pendiente';
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (estado === 'cancelada' && estadoAnterior !== 'cancelada') {
            await revertirVentaCancelada(client, ventaActual.venta, req.usuario.id);
        }

        const campos = [];
        const valores = [];
        let idx = 1;

        if (estado) {
            campos.push(`estado_entrega = $${idx++}`);
            valores.push(estado);
        }
        if (notas_entrega !== undefined) {
            campos.push(`notas_entrega = $${idx++}`);
            valores.push(notas_entrega);
        }
        if (fecha_entrega_programada !== undefined) {
            campos.push(`fecha_entrega_programada = $${idx++}`);
            valores.push(fecha_entrega_programada || null);
        }
        if (estado === 'entregada') {
            campos.push('entregado_en = CURRENT_TIMESTAMP');
        }

        let venta;
        if (campos.length > 0) {
            valores.push(ventaId);
            const resultado = await client.query(
                `UPDATE ventas SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
                valores
            );
            venta = resultado.rows[0];
        } else {
            const resultado = await client.query('SELECT * FROM ventas WHERE id = $1', [ventaId]);
            venta = resultado.rows[0];
        }

        await client.query('COMMIT');
        sendSuccess(res, { mensaje: 'Entrega actualizada', datos: venta });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

module.exports = {
    listarEntregas,
    actualizarEntrega
};
