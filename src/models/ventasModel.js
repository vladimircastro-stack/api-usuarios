const pool = require('../db');

const obtenerConexion = async () => pool.connect();

const obtenerVentas = async () => {
    const resultado = await pool.query(
        `SELECT
            ventas.id,
            clientes.nombre AS cliente,
            ventas.total,
            ventas.fecha_venta
         FROM ventas
         LEFT JOIN clientes ON ventas.cliente_id = clientes.id
         ORDER BY ventas.id DESC`
    );
    return resultado.rows;
};

const buscarVentaPorId = async (id) => {
    const venta = await pool.query(
        `SELECT
            ventas.id,
            ventas.cliente_id,
            ventas.usuario_id,
            clientes.nombre AS cliente,
            ventas.total,
            ventas.fecha_venta
         FROM ventas
         LEFT JOIN clientes ON ventas.cliente_id = clientes.id
         WHERE ventas.id = $1`,
        [id]
    );

    const detalle = await pool.query(
        `SELECT
            detalle_ventas.producto_id,
            productos.nombre,
            detalle_ventas.cantidad,
            detalle_ventas.precio,
            detalle_ventas.subtotal
         FROM detalle_ventas
         INNER JOIN productos ON detalle_ventas.producto_id = productos.id
         WHERE detalle_ventas.venta_id = $1
         ORDER BY detalle_ventas.id`,
        [id]
    );

    return {
        venta: venta.rows[0],
        detalle: detalle.rows
    };
};

const crearVenta = async (client, cliente_id, usuario_id, total) => {
    const resultado = await client.query(
        `INSERT INTO ventas (cliente_id, usuario_id, total)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [cliente_id, usuario_id, total]
    );
    return resultado.rows[0];
};

const crearDetalleVenta = async (
    client,
    venta_id,
    producto_id,
    cantidad,
    precio,
    subtotal
) => {
    const resultado = await client.query(
        `INSERT INTO detalle_ventas
         (venta_id, producto_id, cantidad, precio, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [venta_id, producto_id, cantidad, precio, subtotal]
    );
    return resultado.rows[0];
};

const buscarClientePorIdConCliente = async (client, id) => {
    const resultado = await client.query(
        'SELECT id FROM clientes WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerConexion,
    obtenerVentas,
    buscarVentaPorId,
    crearVenta,
    crearDetalleVenta,
    buscarClientePorIdConCliente
};
