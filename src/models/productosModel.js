const pool = require('../db');

const obtenerProductos = async () => {
    const resultado = await pool.query(
        'SELECT * FROM productos ORDER BY id'
    );
    return resultado.rows;
};

const buscarProductoPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM productos WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

const buscarProductoPorIdConCliente = async (client, id) => {
    const resultado = await client.query(
        'SELECT * FROM productos WHERE id = $1 FOR UPDATE',
        [id]
    );
    return resultado.rows[0];
};

const crearProducto = async (
    nombre,
    categoria,
    unidad_medida,
    cantidad,
    precio_compra,
    precio_venta
) => {
    const resultado = await pool.query(
        `INSERT INTO productos
         (nombre, categoria, unidad_medida, cantidad, precio_compra, precio_venta)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombre, categoria, unidad_medida, cantidad, precio_compra, precio_venta]
    );
    return resultado.rows[0];
};

const actualizarProducto = async (
    id,
    nombre,
    categoria,
    unidad_medida,
    cantidad,
    precio_compra,
    precio_venta
) => {
    const resultado = await pool.query(
        `UPDATE productos
         SET nombre = $1,
             categoria = $2,
             unidad_medida = $3,
             cantidad = $4,
             precio_compra = $5,
             precio_venta = $6
         WHERE id = $7
         RETURNING *`,
        [nombre, categoria, unidad_medida, cantidad, precio_compra, precio_venta, id]
    );
    return resultado.rows[0];
};

const eliminarProducto = async (id) => {
    const resultado = await pool.query(
        'DELETE FROM productos WHERE id = $1 RETURNING *',
        [id]
    );
    return resultado.rows[0];
};

const descontarInventario = async (client, producto_id, cantidad) => {
    const resultado = await client.query(
        `UPDATE productos
         SET cantidad = cantidad - $1
         WHERE id = $2
           AND cantidad >= $1
         RETURNING *`,
        [cantidad, producto_id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerProductos,
    buscarProductoPorId,
    buscarProductoPorIdConCliente,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    descontarInventario
};
