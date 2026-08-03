const pool = require('../db');

const obtenerClientes = async () => {
    const resultado = await pool.query(
        'SELECT * FROM clientes ORDER BY id'
    );
    return resultado.rows;
};

const buscarClientePorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM clientes WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

const crearCliente = async (nombre, telefono, correo, direccion) => {
    const resultado = await pool.query(
        `INSERT INTO clientes (nombre, telefono, correo, direccion)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nombre, telefono, correo, direccion]
    );
    return resultado.rows[0];
};

const actualizarCliente = async (id, nombre, telefono, correo, direccion) => {
    const resultado = await pool.query(
        `UPDATE clientes
         SET nombre = $1, telefono = $2, correo = $3, direccion = $4
         WHERE id = $5
         RETURNING *`,
        [nombre, telefono, correo, direccion, id]
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
