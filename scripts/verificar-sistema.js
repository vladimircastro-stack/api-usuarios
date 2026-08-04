require('../src/config/env');
const http = require('http');
const pool = require('../src/db');

function healthCheck() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:3000/health', (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

(async () => {
    const health = await healthCheck();
    console.log('Health:', health.datos?.status, '| DB:', health.datos?.database);

    const clientes = await pool.query(
        'SELECT nombre, direccion, telefono, horario_entrega FROM clientes ORDER BY nombre'
    );
    console.log('Cocinas:', clientes.rows.length);
    clientes.rows.forEach((c) => {
        console.log(`  - ${c.nombre}: ${c.direccion} | ${c.telefono}`);
    });

    const entregas = await pool.query(
        `SELECT COUNT(*)::int AS n FROM ventas
         WHERE COALESCE(estado_entrega,'pendiente') IN ('pendiente','en_ruta')
         AND (
            DATE(fecha_entrega_programada) = CURRENT_DATE
            OR (fecha_entrega_programada IS NULL AND DATE(fecha_venta) = CURRENT_DATE)
         )`
    );
    console.log('Entregas hoy (pendientes/en ruta):', entregas.rows[0].n);
    console.log('\nSistema corriendo: http://localhost:3000');
    await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
