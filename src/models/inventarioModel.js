const pool = require('../db');

const registrarMovimiento = async (
    client,
    producto_id,
    tipo,
    cantidad,
    cantidad_anterior,
    cantidad_nueva,
    referencia,
    usuario_id
) => {
    const db = client || pool;
    await db.query(
        `INSERT INTO inventario_movimientos
         (producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, referencia, usuario_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [producto_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, referencia, usuario_id]
    );
};

const obtenerMovimientos = async (limite = 50) => {
    const resultado = await pool.query(
        `SELECT
            m.id,
            p.nombre AS producto,
            m.tipo,
            m.cantidad,
            m.cantidad_anterior,
            m.cantidad_nueva,
            m.referencia,
            u.nombre AS usuario,
            m.creado_en
         FROM inventario_movimientos m
         INNER JOIN productos p ON m.producto_id = p.id
         LEFT JOIN usuarios u ON m.usuario_id = u.id
         ORDER BY m.creado_en DESC
         LIMIT $1`,
        [limite]
    );
    return resultado.rows;
};

const obtenerBajoStock = async () => {
    const resultado = await pool.query(
        `SELECT id, nombre, categoria, unidad_medida, cantidad, stock_minimo, precio_venta
         FROM productos
         WHERE activo = TRUE AND cantidad <= stock_minimo
         ORDER BY cantidad ASC`
    );
    return resultado.rows;
};

const ajustarInventario = async (producto_id, cantidadNueva, referencia, usuario_id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const actual = await client.query(
            'SELECT cantidad FROM productos WHERE id = $1 FOR UPDATE',
            [producto_id]
        );

        if (!actual.rows[0]) {
            throw new Error('Producto no encontrado');
        }

        const anterior = Number(actual.rows[0].cantidad);
        const nueva = Number(cantidadNueva);

        if (nueva < 0) {
            throw new Error('La cantidad no puede ser negativa');
        }

        if (anterior === nueva) {
            await client.query('COMMIT');
            return { cantidad_anterior: anterior, cantidad_nueva: nueva };
        }

        await client.query(
            'UPDATE productos SET cantidad = $1 WHERE id = $2',
            [nueva, producto_id]
        );

        await registrarMovimiento(
            client,
            producto_id,
            'ajuste',
            Math.abs(nueva - anterior),
            anterior,
            nueva,
            referencia || 'Ajuste manual',
            usuario_id
        );

        await client.query('COMMIT');
        return { cantidad_anterior: anterior, cantidad_nueva: nueva };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const resumenInventario = async () => {
    const resultado = await pool.query(
        `SELECT
            COUNT(*)::int AS total_productos,
            COALESCE(SUM(cantidad * precio_compra), 0) AS valor_compra,
            COALESCE(SUM(cantidad * precio_venta), 0) AS valor_venta,
            COUNT(*) FILTER (WHERE cantidad <= stock_minimo)::int AS bajo_stock
         FROM productos
         WHERE activo = TRUE`
    );
    return resultado.rows[0];
};

module.exports = {
    registrarMovimiento,
    obtenerMovimientos,
    obtenerBajoStock,
    ajustarInventario,
    resumenInventario,
    restaurarInventarioPorVenta
};

async function restaurarInventarioPorVenta(client, venta_id, usuario_id) {
    const movimientos = await client.query(
        `SELECT producto_id, cantidad FROM inventario_movimientos
         WHERE referencia = $1 AND tipo = 'venta'`,
        [`Venta #${venta_id}`]
    );

    for (const linea of movimientos.rows) {
        const actual = await client.query(
            'SELECT cantidad FROM productos WHERE id = $1 FOR UPDATE',
            [linea.producto_id]
        );

        if (!actual.rows[0]) continue;

        const anterior = Number(actual.rows[0].cantidad);
        const cantidad = Number(linea.cantidad);
        const nueva = anterior + cantidad;

        await client.query(
            'UPDATE productos SET cantidad = $1 WHERE id = $2',
            [nueva, linea.producto_id]
        );

        await registrarMovimiento(
            client,
            linea.producto_id,
            'devolucion',
            cantidad,
            anterior,
            nueva,
            `Cancelación venta #${venta_id}`,
            usuario_id
        );
    }
}
