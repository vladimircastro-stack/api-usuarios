const pool = require('../db');
const { valorCanastos } = require('../config/empresa');

// Saldo simple: registros pendientes de peso tienen cantidad=0 hasta confirmar.
const CANASTOS_SALDO = `CASE WHEN m.tipo = 'entrega' THEN m.cantidad ELSE -m.cantidad END`;

const obtenerClientes = async () => {
    const resultado = await pool.query(
        `SELECT
            c.*,
            COALESCE((
                SELECT SUM(${CANASTOS_SALDO})
                FROM canastos_movimientos m
                WHERE m.cliente_id = c.id
            ), 0) AS canastos_debe,
            COALESCE((
                SELECT SUM(CASE WHEN cr.tipo = 'cargo' THEN cr.monto ELSE -cr.monto END)
                FROM credito_movimientos cr
                WHERE cr.cliente_id = c.id
            ), 0) AS credito_debe
         FROM clientes c
         ORDER BY c.nombre`
    );
    return resultado.rows.map((r) => {
        const canastos_debe = Number(r.canastos_debe || 0);
        return {
            ...r,
            canastos_debe,
            canastos_valor_debe: valorCanastos(canastos_debe),
            credito_debe: Number(r.credito_debe || 0),
            limite_credito: r.limite_credito != null ? Number(r.limite_credito) : null
        };
    });
};

const buscarClientePorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM clientes WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

const crearCliente = async (nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite_credito) => {
    const resultado = await pool.query(
        `INSERT INTO clientes (nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite_credito)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
            nombre,
            telefono,
            correo,
            direccion,
            tipo || 'cocina_industrial',
            contacto,
            horario_entrega,
            limite_credito ?? null
        ]
    );
    return resultado.rows[0];
};

const actualizarCliente = async (
    id,
    nombre,
    telefono,
    correo,
    direccion,
    tipo,
    contacto,
    horario_entrega,
    limite_credito
) => {
    const resultado = await pool.query(
        `UPDATE clientes
         SET nombre = $1,
             telefono = $2,
             correo = $3,
             direccion = $4,
             tipo = $5,
             contacto = $6,
             horario_entrega = $7,
             limite_credito = $8
         WHERE id = $9
         RETURNING *`,
        [nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite_credito ?? null, id]
    );
    return resultado.rows[0];
};

const eliminarCliente = async (id) => {
    const resultado = await pool.query(
        'DELETE FROM clientes WHERE id = $1 RETURNING *',
        [id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerClientes,
    buscarClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
