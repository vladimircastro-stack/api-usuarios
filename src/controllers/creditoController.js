const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    registrarMovimiento,
    saldoCliente,
    resumenClientes,
    historialCliente,
    totalCreditoPendiente
} = require('../models/creditoModel');
const { buscarClientePorId } = require('../models/clientesModel');

const resumen = asyncHandler(async (req, res) => {
    const clientes = await resumenClientes();
    const total = await totalCreditoPendiente();
    sendSuccess(res, {
        mensaje: 'Resumen de crédito',
        datos: { total_pendiente: total, clientes }
    });
});

const saldo = asyncHandler(async (req, res) => {
    const cliente = await buscarClientePorId(req.params.id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    const debe = await saldoCliente(req.params.id);
    const historial = await historialCliente(req.params.id);

    sendSuccess(res, {
        mensaje: 'Estado de crédito del cliente',
        datos: {
            cliente_id: Number(req.params.id),
            cliente: cliente.nombre,
            credito_debe: debe,
            historial
        }
    });
});

const abono = asyncHandler(async (req, res) => {
    const { cliente_id, monto, notas } = req.body;
    const cliente = await buscarClientePorId(cliente_id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
        throw new AppError('El monto del pago debe ser mayor a 0', 400);
    }

    const pendiente = await saldoCliente(cliente_id);
    if (montoNum > pendiente) {
        throw new AppError(
            `El pago no puede ser mayor al saldo pendiente ($${pendiente.toFixed(2)})`,
            400
        );
    }

    await registrarMovimiento(
        null,
        cliente_id,
        'abono',
        montoNum,
        null,
        notas || 'Pago registrado',
        req.usuario.id
    );

    const nuevoSaldo = await saldoCliente(cliente_id);
    sendSuccess(res, {
        mensaje: 'Pago registrado correctamente',
        datos: { credito_debe: nuevoSaldo },
        statusCode: 201
    });
});

module.exports = { resumen, saldo, abono };
