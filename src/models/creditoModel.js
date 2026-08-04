const pool = require('../db');

const registrarMovimiento = async (client, cliente_id, tipo, monto, venta_id, notas, usuario_id) => {
    const db = client || pool;
    await db.query(
        `INSERT INTO credito_movimientos
         (cliente_id, tipo, monto, venta_id, notas, usuario_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cliente_id, tipo, monto, venta_id || null, notas || null, usuario_id]
    );
};

const saldoCliente = async (cliente_id) => {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(
            CASE WHEN tipo = 'cargo' THEN monto ELSE -monto END
         ), 0) AS debe
         FROM credito_movimientos
         WHERE cliente_id = $1`,
        [cliente_id]
    );
    return Number(resultado.rows[0].debe);
};

const resumenClientes = async () => {
    const resultado = await pool.query(
        `SELECT
            c.id,
            c.nombre,
            COALESCE(SUM(
                CASE WHEN m.tipo = 'cargo' THEN m.monto ELSE -m.monto END
            ), 0) AS credito_debe
         FROM clientes c
         LEFT JOIN credito_movimientos m ON m.cliente_id = c.id
         GROUP BY c.id, c.nombre
         HAVING COALESCE(SUM(
            CASE WHEN m.tipo = 'cargo' THEN m.monto ELSE -m.monto END
         ), 0) > 0
         ORDER BY credito_debe DESC`
    );
    return resultado.rows.map((r) => ({
        ...r,
        credito_debe: Number(r.credito_debe)
    }));
};

const historialCliente = async (cliente_id, limite = 40) => {
    const resultado = await pool.query(
        `SELECT id, tipo, monto, venta_id, notas, creado_en
         FROM credito_movimientos
         WHERE cliente_id = $1
         ORDER BY creado_en DESC
         LIMIT $2`,
        [cliente_id, limite]
    );
    return resultado.rows;
};

const totalCreditoPendiente = async () => {
    const resultado = await pool.query(
        `SELECT COALESCE(SUM(
            CASE WHEN tipo = 'cargo' THEN monto ELSE -monto END
         ), 0) AS total
         FROM credito_movimientos`
    );
    return Number(resultado.rows[0].total);
};

module.exports = {
    registrarMovimiento,
    saldoCliente,
    resumenClientes,
    historialCliente,
    totalCreditoPendiente
};
