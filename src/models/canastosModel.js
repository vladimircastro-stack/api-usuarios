const pool = require('../db');

const SALDO_EXPR = `CASE
    WHEN tipo = 'entrega' THEN
        CASE WHEN COALESCE(estado, 'confirmado') = 'pendiente_canastos' THEN 0 ELSE cantidad END
    ELSE -cantidad
END`;

// Misma lógica con alias m.* (clientes también tiene columna tipo).
const SALDO_EXPR_M = `CASE
    WHEN m.tipo = 'entrega' THEN
        CASE WHEN COALESCE(m.estado, 'confirmado') = 'pendiente_canastos' THEN 0 ELSE m.cantidad END
    ELSE -m.cantidad
END`;

const registrarMovimiento = async (
    client,
    cliente_id,
    tipo,
    cantidad,
    venta_id,
    notas,
    usuario_id,
    extra = {}
) => {
    const db = client || pool;
    const {
        producto_id = null,
        cantidad_producto = null,
        peso_lb = null,
        modo = 'vacio',
        estado = 'confirmado'
    } = extra;

    await db.query(
        `INSERT INTO canastos_movimientos
         (cliente_id, tipo, cantidad, venta_id, notas, usuario_id,
          producto_id, cantidad_producto, peso_lb, modo, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
            cliente_id,
            tipo,
            cantidad,
            venta_id || null,
            notas || null,
            usuario_id,
            producto_id,
            cantidad_producto,
            peso_lb,
            modo,
            estado
        ]
    );
};

const saldoCliente = async (cliente_id) => {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(${SALDO_EXPR}), 0) AS pendientes
         FROM canastos_movimientos
         WHERE cliente_id = $1`,
        [cliente_id]
    );
    return Number(resultado.rows[0].pendientes);
};

const resumenClientes = async () => {
    const resultado = await pool.query(
        `SELECT
            c.id,
            c.nombre,
            COALESCE(SUM(${SALDO_EXPR_M.replace(/\n\s*/g, ' ')}), 0) AS canastos_debe
         FROM clientes c
         LEFT JOIN canastos_movimientos m ON m.cliente_id = c.id
         GROUP BY c.id, c.nombre
         HAVING COALESCE(SUM(${SALDO_EXPR_M.replace(/\n\s*/g, ' ')}), 0) > 0
         ORDER BY canastos_debe DESC`
    );
    return resultado.rows.map((r) => ({
        ...r,
        canastos_debe: Number(r.canastos_debe)
    }));
};

const historialCliente = async (cliente_id, limite = 50) => {
    const resultado = await pool.query(
        `SELECT
            m.id,
            m.tipo,
            m.cantidad,
            m.venta_id,
            m.notas,
            m.creado_en,
            m.producto_id,
            m.cantidad_producto,
            m.peso_lb,
            m.modo,
            m.estado,
            p.nombre AS producto_nombre
         FROM canastos_movimientos m
         LEFT JOIN productos p ON p.id = m.producto_id
         WHERE m.cliente_id = $1
         ORDER BY m.creado_en DESC
         LIMIT $2`,
        [cliente_id, limite]
    );
    return resultado.rows;
};

const totalCanastosPendientes = async () => {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(${SALDO_EXPR.replace(/\n\s*/g, ' ')}), 0) AS total
         FROM canastos_movimientos`
    );
    return Number(resultado.rows[0].total);
};

const totalesCanastosCalle = async () => {
    const resultado = await pool.query(
        `SELECT
            COALESCE(SUM(
                CASE
                    WHEN tipo = 'entrega'
                        AND COALESCE(estado, 'confirmado') <> 'pendiente_canastos'
                    THEN cantidad
                    ELSE 0
                END
            ), 0) AS total_entregados,
            COALESCE(SUM(
                CASE WHEN tipo = 'devolucion' THEN cantidad ELSE 0 END
            ), 0) AS total_devueltos,
            COALESCE(SUM(${SALDO_EXPR.replace(/\n\s*/g, ' ')}), 0) AS en_la_calle
         FROM canastos_movimientos`
    );
    const row = resultado.rows[0];
    return {
        total_entregados: Number(row.total_entregados),
        total_devueltos: Number(row.total_devueltos),
        en_la_calle: Number(row.en_la_calle)
    };
};

const contarPendientesConfirmar = async () => {
    const resultado = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM canastos_movimientos
         WHERE estado = 'pendiente_canastos' AND tipo = 'entrega'`
    );
    return Number(resultado.rows[0].total);
};

const listarPendientesConfirmar = async () => {
    const resultado = await pool.query(
        `SELECT
            m.id,
            m.cliente_id,
            c.nombre AS cliente_nombre,
            m.producto_id,
            p.nombre AS producto_nombre,
            m.peso_lb,
            m.cantidad_producto,
            m.venta_id,
            m.notas,
            m.creado_en
         FROM canastos_movimientos m
         JOIN clientes c ON c.id = m.cliente_id
         LEFT JOIN productos p ON p.id = m.producto_id
         WHERE m.estado = 'pendiente_canastos' AND m.tipo = 'entrega'
         ORDER BY m.creado_en ASC`
    );
    return resultado.rows;
};

const listarMovimientos = async ({ cliente_id, limite = 100 } = {}) => {
    const params = [];
    let where = 'WHERE 1=1';

    if (cliente_id) {
        params.push(cliente_id);
        where += ` AND m.cliente_id = $${params.length}`;
    }

    params.push(limite);
    const limiteIdx = params.length;

    const resultado = await pool.query(
        `SELECT
            m.id,
            m.cliente_id,
            c.nombre AS cliente_nombre,
            m.tipo,
            m.cantidad,
            m.venta_id,
            m.notas,
            m.creado_en,
            m.producto_id,
            p.nombre AS producto_nombre,
            m.cantidad_producto,
            m.peso_lb,
            m.modo,
            m.estado
         FROM canastos_movimientos m
         JOIN clientes c ON c.id = m.cliente_id
         LEFT JOIN productos p ON p.id = m.producto_id
         ${where}
         ORDER BY m.creado_en DESC
         LIMIT $${limiteIdx}`,
        params
    );
    return resultado.rows;
};

const buscarMovimiento = async (id) => {
    const resultado = await pool.query(
        `SELECT m.*, c.nombre AS cliente_nombre, p.nombre AS producto_nombre
         FROM canastos_movimientos m
         JOIN clientes c ON c.id = m.cliente_id
         LEFT JOIN productos p ON p.id = m.producto_id
         WHERE m.id = $1`,
        [id]
    );
    return resultado.rows[0] || null;
};

const confirmarMovimiento = async (id, cantidad, notasExtra, usuario_id) => {
    const mov = await buscarMovimiento(id);
    if (!mov) return null;
    if (mov.estado !== 'pendiente_canastos') {
        throw new Error('Este registro ya fue confirmado');
    }
    if (Number(cantidad) <= 0) {
        throw new Error('Indique cuantos canastos se llenaron');
    }

    const notas = [mov.notas, notasExtra].filter(Boolean).join(' | ');
    await pool.query(
        `UPDATE canastos_movimientos
         SET cantidad = $1, estado = 'confirmado', notas = $2
         WHERE id = $3`,
        [cantidad, notas || null, id]
    );

    return buscarMovimiento(id);
};

module.exports = {
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
    confirmarMovimiento,
    SALDO_EXPR
};
