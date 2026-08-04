/**
 * Deja la base de datos limpia para que el administrador cargue cocinas, productos y ventas reales.
 * Conserva: usuarios del equipo, configuracion de empresa (nombre RYV, precio canasto).
 *
 * Ejecutar: node scripts/limpiar-para-produccion.js
 *          npm run preparar:produccion
 */
require('../src/config/env');
const pool = require('../src/db');
const { DEFAULT_EMPRESA } = require('../src/constants/product');

const USUARIOS_CONSERVAR = [
    'vladimirnuevo@gmail.com',
    'admin@ryvfrutas.com',
    'vendedor@ryvfrutas.com',
    'repartidor@ryvfrutas.com',
    'almacen@ryvfrutas.com'
];

async function contar(tabla) {
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${tabla}`);
    return r.rows[0].n;
}

async function run() {
    console.log('=== VC DistribuidorPro — Limpieza para produccion ===\n');

    const antes = {
        clientes: await contar('clientes'),
        productos: await contar('productos'),
        ventas: await contar('ventas'),
        canastos: await contar('canastos_movimientos'),
        credito: await contar('credito_movimientos'),
        inventario: await contar('inventario_movimientos')
    };

    console.log('Datos actuales:');
    console.table(antes);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM canastos_movimientos');
        await client.query('DELETE FROM credito_movimientos');
        await client.query('DELETE FROM inventario_movimientos');
        await client.query('DELETE FROM detalle_ventas');
        await client.query('DELETE FROM ventas');
        await client.query('DELETE FROM clientes');
        await client.query('DELETE FROM productos');

        await client.query(
            `DELETE FROM usuarios
             WHERE LOWER(correo) NOT IN (${USUARIOS_CONSERVAR.map((_, i) => `$${i + 1}`).join(', ')})`,
            USUARIOS_CONSERVAR.map((c) => c.toLowerCase())
        );

        const secuencias = [
            'canastos_movimientos_id_seq',
            'credito_movimientos_id_seq',
            'inventario_movimientos_id_seq',
            'detalle_ventas_id_seq',
            'ventas_id_seq',
            'clientes_id_seq',
            'productos_id_seq'
        ];

        for (const seq of secuencias) {
            await client.query(`ALTER SEQUENCE IF EXISTS ${seq} RESTART WITH 1`);
        }

        await client.query(
            `INSERT INTO empresa_config (clave, valor, actualizado_en)
             VALUES ('nombre_empresa', $1, NOW())
             ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW()`,
            [DEFAULT_EMPRESA]
        );

        await client.query(
            `INSERT INTO empresa_config (clave, valor, actualizado_en)
             VALUES ('precio_canasto', '500', NOW())
             ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW()`
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    const usuarios = await pool.query(
        `SELECT id, nombre, correo, rol FROM usuarios ORDER BY rol, nombre`
    );

    console.log('\nLIMPIEZA COMPLETA');
    console.log('  Cocinas (clientes): 0');
    console.log('  Productos: 0');
    console.log('  Ventas / facturas: 0');
    console.log('  Canastos, credito, inventario: 0');
    console.log(`  Empresa: ${DEFAULT_EMPRESA}`);
    console.log('  Precio canasto: RD$ 500 (cambiar en Configuracion)');
    console.log('\nUsuarios conservados:');
    console.table(usuarios.rows);

    console.log('\nSiguiente paso para el administrador:');
    console.log('  1. Configuracion — nombre empresa y precio canasto');
    console.log('  2. Productos — agregar frutas y precios');
    console.log('  3. Cocinas — agregar clientes');
    console.log('  4. Facturacion — primera venta real');
}

run()
    .catch((err) => {
        console.error('Error:', err.message);
        process.exit(1);
    })
    .finally(() => pool.end());
