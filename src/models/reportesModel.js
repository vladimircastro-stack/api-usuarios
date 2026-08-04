const pool = require('../db');

const FILTRO_ACTIVAS = `COALESCE(estado_entrega, 'pendiente') != 'cancelada'`;

const reporteVentas = async (desde, hasta) => {
    const resultado = await pool.query(
        `SELECT
            DATE(fecha_venta) AS fecha,
            COUNT(*)::int AS total_ventas,
            COALESCE(SUM(total), 0) AS monto_total,
            COALESCE(SUM(total) FILTER (WHERE COALESCE(tipo_pago, 'contado') = 'contado'), 0) AS monto_contado,
            COALESCE(SUM(total) FILTER (WHERE tipo_pago = 'credito'), 0) AS monto_credito
         FROM ventas
         WHERE ${FILTRO_ACTIVAS}
           AND ($1::date IS NULL OR fecha_venta >= $1)
           AND ($2::date IS NULL OR fecha_venta < ($2::date + INTERVAL '1 day'))
         GROUP BY DATE(fecha_venta)
         ORDER BY fecha DESC`,
        [desde || null, hasta || null]
    );
    return resultado.rows;
};

const reporteVentasPorCliente = async (desde, hasta) => {
    const resultado = await pool.query(
        `SELECT
            c.nombre AS cliente,
            c.tipo,
            COUNT(v.id)::int AS total_entregas,
            COALESCE(SUM(v.total), 0) AS monto_total
         FROM ventas v
         INNER JOIN clientes c ON v.cliente_id = c.id
         WHERE COALESCE(v.estado_entrega, 'pendiente') != 'cancelada'
           AND ($1::date IS NULL OR v.fecha_venta >= $1)
           AND ($2::date IS NULL OR v.fecha_venta < ($2::date + INTERVAL '1 day'))
         GROUP BY c.id, c.nombre, c.tipo
         ORDER BY monto_total DESC`,
        [desde || null, hasta || null]
    );
    return resultado.rows;
};

const reporteProductosMasVendidos = async (desde, hasta, limite = 10) => {
    const resultado = await pool.query(
        `SELECT
            p.nombre,
            p.categoria,
            SUM(d.cantidad) AS cantidad_vendida,
            SUM(d.subtotal) AS ingresos
         FROM detalle_ventas d
         INNER JOIN productos p ON d.producto_id = p.id
         INNER JOIN ventas v ON d.venta_id = v.id
         WHERE COALESCE(v.estado_entrega, 'pendiente') != 'cancelada'
           AND ($1::date IS NULL OR v.fecha_venta >= $1)
           AND ($2::date IS NULL OR v.fecha_venta < ($2::date + INTERVAL '1 day'))
         GROUP BY p.id, p.nombre, p.categoria
         ORDER BY cantidad_vendida DESC
         LIMIT $3`,
        [desde || null, hasta || null, limite]
    );
    return resultado.rows;
};

const reporteEntregasPorEstado = async () => {
    const resultado = await pool.query(
        `SELECT
            COALESCE(estado_entrega, 'pendiente') AS estado,
            COUNT(*)::int AS total
         FROM ventas
         GROUP BY estado_entrega
         ORDER BY total DESC`
    );
    return resultado.rows;
};

const dashboardResumen = async () => {
    const resultado = await pool.query(
        `SELECT
            (SELECT COUNT(*)::int FROM clientes) AS total_clientes,
            (SELECT COUNT(*)::int FROM productos WHERE activo = TRUE) AS total_productos,
            (SELECT COUNT(*)::int FROM ventas
             WHERE fecha_venta >= CURRENT_DATE AND ${FILTRO_ACTIVAS}) AS ventas_hoy,
            (SELECT COALESCE(SUM(total), 0) FROM ventas
             WHERE fecha_venta >= CURRENT_DATE AND ${FILTRO_ACTIVAS}
               AND COALESCE(tipo_pago, 'contado') = 'contado') AS ingresos_contado_hoy,
            (SELECT COALESCE(SUM(total), 0) FROM ventas
             WHERE fecha_venta >= CURRENT_DATE AND ${FILTRO_ACTIVAS}
               AND tipo_pago = 'credito') AS ventas_credito_hoy,
            (SELECT COUNT(*)::int FROM ventas WHERE estado_entrega = 'pendiente') AS entregas_pendientes,
            (SELECT COUNT(*)::int FROM productos WHERE activo = TRUE AND cantidad <= stock_minimo) AS bajo_stock,
            (SELECT COALESCE(SUM(
                CASE WHEN tipo = 'entrega' THEN cantidad ELSE -cantidad END
            ), 0) FROM canastos_movimientos) AS canastos_pendientes,
            (SELECT COALESCE(SUM(
                CASE WHEN tipo = 'cargo' THEN monto ELSE -monto END
            ), 0) FROM credito_movimientos) AS credito_pendiente`
    );
    return resultado.rows[0];
};

module.exports = {
    reporteVentas,
    reporteVentasPorCliente,
    reporteProductosMasVendidos,
    reporteEntregasPorEstado,
    dashboardResumen
};
