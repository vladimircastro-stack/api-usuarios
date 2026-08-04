require('../src/config/env');
const pool = require('../src/db');

async function run() {
    await pool.query(
        `UPDATE productos SET unidad_medida = 'canasto'
         WHERE LOWER(nombre) LIKE '%guineo%'`
    );

    await pool.query(
        `UPDATE productos SET unidad_medida = 'lb'
         WHERE LOWER(nombre) LIKE '%papaya%'
            OR LOWER(nombre) LIKE '%lechosa%'
            OR LOWER(nombre) LIKE '%sandía%'
            OR LOWER(nombre) LIKE '%sandia%'
            OR LOWER(nombre) LIKE '%melón%'
            OR LOWER(nombre) LIKE '%melon%'`
    );

    await pool.query(
        `UPDATE productos SET nombre = 'Lechosa (Papaya)'
         WHERE LOWER(nombre) = 'papaya'`
    );

    const melon = await pool.query(
        `SELECT id FROM productos
         WHERE LOWER(nombre) LIKE '%melón%' OR LOWER(nombre) LIKE '%melon%'`
    );

    if (melon.rows.length === 0) {
        await pool.query(
            `INSERT INTO productos
             (nombre, categoria, unidad_medida, cantidad, precio_compra, precio_venta, stock_minimo, activo)
             VALUES ('Melón', 'Frutas', 'lb', 0, 25, 35, 10, TRUE)`
        );
    }

    await pool.query(
        `UPDATE productos SET activo = FALSE
         WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(nombre) ORDER BY id) AS rn
                FROM productos
                WHERE LOWER(nombre) LIKE '%guineo%'
            ) t WHERE rn > 1
         )`
    );

    const productos = await pool.query(
        `SELECT id, nombre, unidad_medida, cantidad, precio_venta, activo
         FROM productos ORDER BY activo DESC, nombre`
    );

    console.log('Productos actualizados:');
    console.table(productos.rows);
    await pool.end();
}

run().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
