const { registrarMovimiento } = require('../models/inventarioModel');
const { registrarMovimiento: registrarCanastos } = require('../models/canastosModel');
const { registrarMovimiento: registrarCredito } = require('../models/creditoModel');

const REF_DEVOLUCION = (ventaId) => `Cancelación venta #${ventaId}`;

const yaRevertida = async (client, ventaId) => {
    const inv = await client.query(
        `SELECT 1 FROM inventario_movimientos
         WHERE referencia = $1 AND tipo = 'devolucion' LIMIT 1`,
        [REF_DEVOLUCION(ventaId)]
    );
    return inv.rows.length > 0;
};

const revertirInventario = async (client, ventaId, usuarioId) => {
    const movimientos = await client.query(
        `SELECT producto_id, cantidad FROM inventario_movimientos
         WHERE referencia = $1 AND tipo = 'venta'`,
        [`Venta #${ventaId}`]
    );

    for (const mov of movimientos.rows) {
        const actual = await client.query(
            'SELECT cantidad FROM productos WHERE id = $1 FOR UPDATE',
            [mov.producto_id]
        );

        if (!actual.rows[0]) continue;

        const anterior = Number(actual.rows[0].cantidad);
        const cantidad = Number(mov.cantidad);
        const nueva = anterior + cantidad;

        await client.query(
            'UPDATE productos SET cantidad = $1 WHERE id = $2',
            [nueva, mov.producto_id]
        );

        await registrarMovimiento(
            client,
            mov.producto_id,
            'devolucion',
            cantidad,
            anterior,
            nueva,
            REF_DEVOLUCION(ventaId),
            usuarioId
        );
    }
};

const revertirCanastos = async (client, ventaId, clienteId, usuarioId) => {
    const entregas = await client.query(
        `SELECT COALESCE(SUM(cantidad), 0) AS total
         FROM canastos_movimientos
         WHERE venta_id = $1 AND tipo = 'entrega'`,
        [ventaId]
    );

    const devoluciones = await client.query(
        `SELECT COALESCE(SUM(cantidad), 0) AS total
         FROM canastos_movimientos
         WHERE venta_id = $1 AND tipo = 'devolucion'`,
        [ventaId]
    );

    const pendiente = Number(entregas.rows[0].total) - Number(devoluciones.rows[0].total);

    if (pendiente > 0) {
        await registrarCanastos(
            client,
            clienteId,
            'devolucion',
            pendiente,
            ventaId,
            REF_DEVOLUCION(ventaId),
            usuarioId
        );
    }
};

const revertirCredito = async (client, venta, usuarioId) => {
    if (venta.tipo_pago !== 'credito') return;

    const abonoPrevio = await client.query(
        `SELECT 1 FROM credito_movimientos
         WHERE venta_id = $1 AND tipo = 'abono' LIMIT 1`,
        [venta.id]
    );

    if (abonoPrevio.rows.length > 0) return;

    const cargo = await client.query(
        `SELECT COALESCE(SUM(monto), 0) AS total
         FROM credito_movimientos
         WHERE venta_id = $1 AND tipo = 'cargo'`,
        [venta.id]
    );

    const monto = Number(cargo.rows[0].total);
    if (monto <= 0) return;

    await registrarCredito(
        client,
        venta.cliente_id,
        'abono',
        monto,
        venta.id,
        REF_DEVOLUCION(venta.id),
        usuarioId
    );
};

const revertirVentaCancelada = async (client, venta, usuarioId) => {
    if (await yaRevertida(client, venta.id)) {
        return;
    }

    await revertirInventario(client, venta.id, usuarioId);
    await revertirCanastos(client, venta.id, venta.cliente_id, usuarioId);
    await revertirCredito(client, venta, usuarioId);
};

module.exports = { revertirVentaCancelada };
