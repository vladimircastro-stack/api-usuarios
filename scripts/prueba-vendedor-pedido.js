/**
 * Prueba vendedor: crear pedido nuevo (API + verificación en listado).
 * node scripts/prueba-vendedor-pedido.js
 */
const http = require('http');
require('../src/config/env');
const pool = require('../src/db');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers.Authorization = `Bearer ${token}`;
        if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                let json;
                try { json = JSON.parse(data); } catch { json = { raw: data }; }
                resolve({ status: res.statusCode, body: json });
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function main() {
    console.log('=== PRUEBA VENDEDOR — Nuevo pedido ===\n');

    const login = await request('POST', '/login', {
        correo: 'vendedor@ryvfrutas.com',
        password: 'RYVVende2026!'
    });

    if (!login.body.token) {
        console.error('FAIL Login:', login.body.mensaje);
        process.exit(1);
    }
    console.log('OK Login vendedor');

    const token = login.body.token;

    const cliente = await pool.query(
        'SELECT id, nombre FROM clientes ORDER BY id LIMIT 1'
    );
    const producto = await pool.query(
        `SELECT id, nombre, precio_venta, cantidad FROM productos
         WHERE activo IS NOT FALSE AND cantidad > 2 ORDER BY id LIMIT 1`
    );

    if (!cliente.rows[0] || !producto.rows[0]) {
        console.error('FAIL: falta cocina o producto con stock');
        process.exit(1);
    }

    const c = cliente.rows[0];
    const p = producto.rows[0];
    const precio = Number(p.precio_venta);
    const cantidad = 3;

    console.log(`OK Cocina: ${c.nombre} (#${c.id})`);
    console.log(`OK Producto: ${p.nombre} — ${cantidad} x $${precio}`);

    const venta = await request('POST', '/ventas', {
        cliente_id: c.id,
        tipo_pago: 'contado',
        productos: [{
            producto_id: p.id,
            cantidad,
            precio,
            descripcion: p.nombre
        }],
        canastos_entregados: 2,
        notas_entrega: 'Pedido prueba vendedor — pantalla Pedidos'
    }, token);

    if (!venta.body.exito) {
        console.error('FAIL Crear pedido:', venta.body.mensaje);
        process.exit(1);
    }

    const id = venta.body.datos?.id;
    const total = venta.body.datos?.total;
    console.log(`OK Pedido creado #${id} — Total $${total} (contado)`);

    const lista = await request('GET', '/ventas', null, token);
    const encontrado = (lista.body.datos || []).find((v) => v.id === id);
    console.log(encontrado
        ? `OK Visible en listado Pedidos — ${encontrado.cliente || c.nombre}`
        : 'FAIL No aparece en listado');

    const detalle = await request('GET', `/ventas/${id}`, null, token);
    const d = detalle.body.datos;
    console.log(`OK Detalle: ${(d?.detalle || []).length} línea(s), pago ${d?.venta?.tipo_pago || d?.tipo_pago}`);

    console.log('\n--- Para ver en navegador ---');
    console.log('1. http://localhost:3000');
    console.log('2. vendedor@ryvfrutas.com');
    console.log(`3. Pedidos → ver pedido #${id}`);

    await pool.end();
}

main().catch(async (e) => {
    console.error('ERROR:', e.message);
    try { await pool.end(); } catch { /* ignore */ }
    process.exit(1);
});
