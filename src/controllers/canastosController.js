const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    registrarMovimiento,
    saldoCliente,
    resumenClientes,
    historialCliente,
    totalCanastosPendientes,
    totalesCanastosCalle,
    contarPendientesConfirmar,
    listarPendientesConfirmar,
    listarMovimientos,
    buscarMovimiento,
    confirmarMovimiento
} = require('../models/canastosModel');
const { buscarClientePorId } = require('../models/clientesModel');
const { buscarProductoPorId } = require('../models/productosModel');
const { valorCanastos, enriquecerCanastos } = require('../utils/canastosHelper');
const { getPrecioCanasto } = require('../models/configModel');

const resumen = asyncHandler(async (req, res) => {
    const clientes = await resumenClientes();
    const calle = await totalesCanastosCalle();
    const pendientesConfirmar = await contarPendientesConfirmar();

    sendSuccess(res, {
        mensaje: 'Resumen de canastos',
        datos: {
            precio_canasto: getPrecioCanasto(),
            total_pendientes: calle.en_la_calle,
            canastos_en_la_calle: calle.en_la_calle,
            total_entregados: calle.total_entregados,
            total_devueltos: calle.total_devueltos,
            total_valor_pendiente: valorCanastos(calle.en_la_calle),
            pendientes_confirmar: pendientesConfirmar,
            clientes: clientes.map((c) => ({
                ...c,
                canastos_valor_debe: valorCanastos(c.canastos_debe)
            }))
        }
    });
});

const saldo = asyncHandler(async (req, res) => {
    const cliente = await buscarClientePorId(req.params.id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    const pendientes = await saldoCliente(req.params.id);
    const historial = await historialCliente(req.params.id);

    sendSuccess(res, {
        mensaje: 'Saldo de canastos',
        datos: {
            cliente_id: Number(req.params.id),
            cliente: cliente.nombre,
            ...enriquecerCanastos(pendientes),
            historial
        }
    });
});

const movimientos = asyncHandler(async (req, res) => {
    const cliente_id = req.query.cliente_id ? Number(req.query.cliente_id) : undefined;
    const lista = await listarMovimientos({ cliente_id });
    sendSuccess(res, { mensaje: 'Movimientos de canastos', datos: lista });
});

const pendientes = asyncHandler(async (req, res) => {
    const lista = await listarPendientesConfirmar();
    sendSuccess(res, {
        mensaje: 'Entregas por peso pendientes de contar canastos',
        datos: lista
    });
});

const entrega = asyncHandler(async (req, res) => {
    const { cliente_id, cantidad, venta_id, notas } = req.body;
    const cliente = await buscarClientePorId(cliente_id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    await registrarMovimiento(
        null,
        cliente_id,
        'entrega',
        cantidad,
        venta_id,
        notas || 'Canastos vacios entregados',
        req.usuario.id,
        { modo: 'vacio', estado: 'confirmado' }
    );

    const saldo = await saldoCliente(cliente_id);
    sendSuccess(res, {
        mensaje: 'Canastos vacios entregados registrados',
        datos: enriquecerCanastos(saldo),
        statusCode: 201
    });
});

const mercancia = asyncHandler(async (req, res) => {
    const {
        cliente_id,
        producto_id,
        modo,
        cantidad_producto,
        peso_lb,
        cantidad_canastos,
        venta_id,
        notas
    } = req.body;

    const cliente = await buscarClientePorId(cliente_id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    if (!['conteo', 'peso'].includes(modo)) {
        throw new AppError('Modo invalido. Use conteo o peso', 400);
    }

    const producto = producto_id ? await buscarProductoPorId(producto_id) : null;
    if (producto_id && !producto) throw new AppError('Producto no encontrado', 404);

    let cantidad = 0;
    let estado = 'confirmado';
    let notaFinal = notas || '';

    if (modo === 'conteo') {
        if (!cantidad_canastos || Number(cantidad_canastos) <= 0) {
            throw new AppError('Indique cuantos canastos se usaron (ej. 20 o 30 con la misma mercancia)', 400);
        }
        cantidad = Number(cantidad_canastos);
        if (cantidad_producto) {
            notaFinal = [notaFinal, `${cantidad_producto} unidades en ${cantidad} canastos`]
                .filter(Boolean)
                .join(' — ');
        }
    }

    if (modo === 'peso') {
        if (!peso_lb || Number(peso_lb) <= 0) {
            throw new AppError('Indique el peso en libras', 400);
        }
        if (cantidad_canastos && Number(cantidad_canastos) > 0) {
            cantidad = Number(cantidad_canastos);
            notaFinal = [notaFinal, `${peso_lb} lb en ${cantidad} canastos`].filter(Boolean).join(' — ');
        } else {
            estado = 'pendiente_canastos';
            notaFinal = [notaFinal, `${peso_lb} lb — canastos por confirmar`].filter(Boolean).join(' — ');
        }
    }

    await registrarMovimiento(
        null,
        cliente_id,
        'entrega',
        cantidad,
        venta_id,
        notaFinal || null,
        req.usuario.id,
        {
            producto_id: producto_id || null,
            cantidad_producto: cantidad_producto ? Number(cantidad_producto) : null,
            peso_lb: peso_lb ? Number(peso_lb) : null,
            modo,
            estado
        }
    );

    const saldo = await saldoCliente(cliente_id);
    sendSuccess(res, {
        mensaje: estado === 'pendiente_canastos'
            ? 'Peso registrado. Confirme los canastos cuando se empacen.'
            : 'Canastos con mercancia registrados',
        datos: {
            ...enriquecerCanastos(saldo),
            estado
        },
        statusCode: 201
    });
});

const confirmar = asyncHandler(async (req, res) => {
    const mov = await buscarMovimiento(req.params.id);
    if (!mov) throw new AppError('Registro no encontrado', 404);
    if (mov.estado !== 'pendiente_canastos') {
        throw new AppError('Este registro ya fue confirmado', 400);
    }

    const { cantidad, notas } = req.body;
    if (!cantidad || Number(cantidad) <= 0) {
        throw new AppError('Indique cuantos canastos se llenaron', 400);
    }

    try {
        await confirmarMovimiento(req.params.id, Number(cantidad), notas, req.usuario.id);
    } catch (error) {
        throw new AppError(error.message, 400);
    }

    const saldo = await saldoCliente(mov.cliente_id);
    sendSuccess(res, {
        mensaje: `${cantidad} canastos confirmados para ${mov.cliente_nombre}`,
        datos: enriquecerCanastos(saldo)
    });
});

const devolucion = asyncHandler(async (req, res) => {
    const { cliente_id, cantidad, notas } = req.body;
    const cliente = await buscarClientePorId(cliente_id);
    if (!cliente) throw new AppError('Cliente no encontrado', 404);

    const pendientes = await saldoCliente(cliente_id);
    if (Number(cantidad) > pendientes) {
        throw new AppError(
            `Solo puede devolver hasta ${pendientes} canastos (saldo actual del cliente)`,
            400
        );
    }

    await registrarMovimiento(
        null,
        cliente_id,
        'devolucion',
        cantidad,
        null,
        notas || 'Devolucion de canastos vacios',
        req.usuario.id,
        { modo: 'vacio', estado: 'confirmado' }
    );

    const nuevoSaldo = await saldoCliente(cliente_id);
    sendSuccess(res, {
        mensaje: 'Devolucion de canastos registrada',
        datos: enriquecerCanastos(nuevoSaldo),
        statusCode: 201
    });
});

module.exports = {
    resumen,
    saldo,
    movimientos,
    pendientes,
    entrega,
    mercancia,
    confirmar,
    devolucion
};
