require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/db');
const canastos = require('../src/models/canastosModel');
const clientes = require('../src/models/clientesModel');
const productos = require('../src/models/productosModel');
const { getPrecioCanasto } = require('../src/models/configModel');
const { valorCanastos } = require('../src/utils/canastosHelper');

async function main() {
    const cols = await pool.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'canastos_movimientos' ORDER BY 1`
    );
    console.log('columnas canastos_movimientos:', cols.rows.map((r) => r.column_name).join(', '));

    const tests = [
        ['resumenClientes', () => canastos.resumenClientes()],
        ['totalesCanastosCalle', () => canastos.totalesCanastosCalle()],
        ['contarPendientesConfirmar', () => canastos.contarPendientesConfirmar()],
        ['listarPendientesConfirmar', () => canastos.listarPendientesConfirmar()],
        ['listarMovimientos', () => canastos.listarMovimientos()],
        ['obtenerClientes', () => clientes.obtenerClientes()],
        ['productos list', () => productos.obtenerProductos()],
        ['getPrecioCanasto', async () => getPrecioCanasto()],
        ['valorCanastos', async () => valorCanastos(5)]
    ];

    for (const [name, fn] of tests) {
        try {
            const r = await fn();
            console.log(`OK ${name}`, Array.isArray(r) ? `[${r.length} items]` : r);
        } catch (e) {
            console.error(`FAIL ${name}:`, e.message);
        }
    }

    await pool.end();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
