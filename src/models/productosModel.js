const pool = require('../db');

const obtenerProductos = async () => {
    const resultado = await pool.query(
        `SELECT * FROM productos
         WHERE COALESCE(activo, TRUE) = TRUE
         ORDER BY nombre`
    );
    return resultado.rows;
};

const obtenerTodosProductos = async () => {
    const resultado = await pool.query(
        'SELECT * FROM productos ORDER BY nombre'
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
    precio_venta,
    stock_minimo,
    activo
) => {
    const resultado = await pool.query(
        `INSERT INTO productos
         (nombre, categoria, unidad_medida, cantidad, precio_compra, precio_venta, stock_minimo, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
            nombre,
            categoria,
            unidad_medida,
            cantidad,
            precio_compra,
            precio_venta,
            stock_minimo ?? 10,
            activo !== false
        ]
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
    precio_venta,
    stock_minimo,
    activo
) => {
    const resultado = await pool.query(
        `UPDATE productos
         SET nombre = $1,
             categoria = $2,
             unidad_medida = $3,
             cantidad = $4,
             precio_compra = $5,
             precio_venta = $6,
             stock_minimo = $7,
             activo = $8
         WHERE id = $9
         RETURNING *`,
        [
            nombre,
            categoria,
            unidad_medida,
            cantidad,
            precio_compra,
            precio_venta,
            stock_minimo ?? 10,
            activo !== false,
            id
        ]
    );
    return resultado.rows[0];
};

const eliminarProducto = async (id) => {
    const resultado = await pool.query(
        `UPDATE productos SET activo = FALSE WHERE id = $1 RETURNING *`,
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
           AND COALESCE(activo, TRUE) = TRUE
         RETURNING *`,
        [cantidad, producto_id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerProductos,
    obtenerTodosProductos,
    buscarProductoPorId,
    buscarProductoPorIdConCliente,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    descontarInventario
};
