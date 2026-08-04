const pool = require('../db');

const obtenerConexion = async () => pool.connect();

const camposVenta = `
    ventas.id,
    ventas.cliente_id,
    ventas.usuario_id,
    clientes.nombre AS cliente,
    clientes.tipo AS cliente_tipo,
    clientes.direccion AS cliente_direccion,
    clientes.telefono AS cliente_telefono,
    clientes.contacto AS cliente_contacto,
    clientes.horario_entrega AS cliente_horario,
    ventas.total,
    ventas.fecha_venta,
    COALESCE(ventas.estado_entrega, 'pendiente') AS estado_entrega,
    ventas.fecha_entrega_programada,
    ventas.notas_entrega,
    ventas.entregado_en,
    COALESCE(ventas.tipo_pago, 'contado') AS tipo_pago
`;

const obtenerVentas = async () => {
    const resultado = await pool.query(
        `SELECT ${camposVenta}
         FROM ventas
         LEFT JOIN clientes ON ventas.cliente_id = clientes.id
         ORDER BY ventas.id DESC`
    );
    return resultado.rows;
};

const obtenerEntregas = async (estado, opciones = {}) => {
    const params = [];
    let filtros = [];

    if (opciones.hoy) {
        filtros.push(`COALESCE(ventas.estado_entrega, 'pendiente') IN ('pendiente', 'en_ruta')`);
        filtros.push(`(
            DATE(ventas.fecha_entrega_programada) = CURRENT_DATE
            OR (
                ventas.fecha_entrega_programada IS NULL
                AND DATE(ventas.fecha_venta) = CURRENT_DATE
            )
        )`);
    }

    if (estado) {
        params.push(estado);
        filtros.push(`COALESCE(ventas.estado_entrega, 'pendiente') = $${params.length}`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

    const resultado = await pool.query(
        `SELECT ${camposVenta}
         FROM ventas
         LEFT JOIN clientes ON ventas.cliente_id = clientes.id
         ${where}
         ORDER BY
            CASE COALESCE(ventas.estado_entrega, 'pendiente')
                WHEN 'pendiente' THEN 1
                WHEN 'en_ruta' THEN 2
                WHEN 'entregada' THEN 3
                ELSE 4
            END,
            ventas.fecha_entrega_programada NULLS LAST,
            clientes.nombre,
            ventas.id DESC`,
        params
    );
    return resultado.rows;
};

const buscarVentaPorId = async (id) => {
    const venta = await pool.query(
        `SELECT ${camposVenta}
         FROM ventas
         LEFT JOIN clientes ON ventas.cliente_id = clientes.id
         WHERE ventas.id = $1`,
        [id]
    );

    const detalle = await pool.query(
        `SELECT
            detalle_ventas.producto_id,
            productos.nombre,
            productos.unidad_medida,
            COALESCE(detalle_ventas.unidad_venta, productos.unidad_medida) AS unidad_venta,
            detalle_ventas.descripcion,
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

const crearVenta = async (
    client,
    cliente_id,
    usuario_id,
    total,
    fecha_entrega_programada,
    notas_entrega,
    tipo_pago
) => {
    const resultado = await client.query(
        `INSERT INTO ventas
         (cliente_id, usuario_id, total, fecha_entrega_programada, notas_entrega, estado_entrega, tipo_pago)
         VALUES ($1, $2, $3, $4, $5, 'pendiente', $6)
         RETURNING *`,
        [cliente_id, usuario_id, total, fecha_entrega_programada || null, notas_entrega || null, tipo_pago || 'contado']
    );
    return resultado.rows[0];
};

const crearDetalleVenta = async (
    client,
    venta_id,
    producto_id,
    cantidad,
    precio,
    subtotal,
    descripcion,
    unidad_venta,
    cantidad_inventario
) => {
    const resultado = await client.query(
        `INSERT INTO detalle_ventas
         (venta_id, producto_id, cantidad, precio, subtotal, descripcion, unidad_venta, cantidad_inventario)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
            venta_id,
            producto_id,
            cantidad,
            precio,
            subtotal,
            descripcion || null,
            unidad_venta || null,
            cantidad_inventario ?? cantidad
        ]
    );
    return resultado.rows[0];
};

const actualizarEstadoEntrega = async (id, { estado, notas_entrega, fecha_entrega_programada }) => {
    const campos = [];
    const valores = [];
    let idx = 1;

    if (estado) {
        campos.push(`estado_entrega = $${idx++}`);
        valores.push(estado);
    }
    if (notas_entrega !== undefined) {
        campos.push(`notas_entrega = $${idx++}`);
        valores.push(notas_entrega);
    }
    if (fecha_entrega_programada !== undefined) {
        campos.push(`fecha_entrega_programada = $${idx++}`);
        valores.push(fecha_entrega_programada || null);
    }
    if (estado === 'entregada') {
        campos.push(`entregado_en = CURRENT_TIMESTAMP`);
    }

    if (campos.length === 0) {
        const actual = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
        return actual.rows[0];
    }

    valores.push(id);
    const resultado = await pool.query(
        `UPDATE ventas SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
        valores
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
    obtenerEntregas,
    buscarVentaPorId,
    crearVenta,
    crearDetalleVenta,
    actualizarEstadoEntrega,
    buscarClientePorIdConCliente
};
