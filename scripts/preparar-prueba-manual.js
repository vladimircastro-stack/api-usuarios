require('../src/config/env');
const pool = require('../src/db');

(async () => {
    const pendientes = await pool.query(`
        SELECT id, estado_entrega, total, cliente_id
        FROM ventas
        WHERE COALESCE(estado_entrega, 'pendiente') IN ('pendiente', 'en_ruta')
        ORDER BY id DESC LIMIT 5
    `);
    console.log('Pendientes:', pendientes.rows);

    if (pendientes.rows.length === 0) {
        const bcrypt = require('bcrypt');
        const http = require('http');
        const login = await new Promise((resolve, reject) => {
            const body = JSON.stringify({
                correo: process.env.PRUEBA_VENDEDOR || 'vendedor@ryvfrutas.com',
                password: process.env.PRUEBA_VENDEDOR_PASS || 'RYVVende2026!'
            });
            const req = http.request({
                hostname: 'localhost', port: 3000, path: '/login', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
            }, (res) => {
                let data = '';
                res.on('data', (c) => { data += c; });
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });

        if (!login.token) {
            console.error('No login:', login.mensaje);
            process.exit(1);
        }

        const ventaBody = JSON.stringify({
            cliente_id: 3,
            tipo_pago: 'contado',
            productos: [{ producto_id: 2, cantidad: 2, precio: 8 }],
            notas_entrega: 'Prueba manual repartidor'
        });

        const venta = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost', port: 3000, path: '/ventas', method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${login.token}`,
                    'Content-Length': Buffer.byteLength(ventaBody)
                }
            }, (res) => {
                let data = '';
                res.on('data', (c) => { data += c; });
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', reject);
            req.write(ventaBody);
            req.end();
        });

        console.log('Pedido creado:', venta.datos?.id || venta.mensaje);
    }

    await pool.end();
})().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
