/**
 * Prueba de flujo completo — simula un día de operación.
 * Ejecutar con el servidor en http://localhost:3000
 * node scripts/prueba-flujo-completo.js
 */
const http = require('http');
require('../src/config/env');
const pool = require('../src/db');

const BASE = 'http://localhost:3000';

const USERS = {
    admin: { correo: 'admin@ryvfrutas.com', password: 'RYVAdmin2026!' },
    vendedor: { correo: 'vendedor@ryvfrutas.com', password: 'RYVVende2026!' },
    repartidor: { correo: 'repartidor@ryvfrutas.com', password: 'RYVReparto2026!' },
    almacen: { correo: 'almacen@ryvfrutas.com', password: 'RYVStock2026!' }
};

const results = [];

function log(step, ok, detail = '') {
    results.push({ step, ok, detail });
    console.log(`${ok ? 'OK' : 'FAIL'} | ${step}${detail ? ` — ${detail}` : ''}`);
}

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers.Authorization = `Bearer ${token}`;
        if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(data); } catch { json = { raw: data }; }
                resolve({ status: res.statusCode, body: json });
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function login(rol) {
    const res = await request('POST', '/login', USERS[rol]);
    return res.body.token;
}

async function main() {
    console.log('=== PRUEBA FLUJO COMPLETO — VC DistribuidorPro ===\n');

    const health = await request('GET', '/health');
    log('1. Servidor y base de datos', health.status === 200 && health.body.datos?.database === 'connected');

    const tokens = {};
    for (const rol of Object.keys(USERS)) {
        tokens[rol] = await login(rol);
        log(`2. Login ${rol}`, !!tokens[rol], USERS[rol].correo);
    }

    if (!tokens.vendedor) {
        console.log('\nEjecuta primero: node scripts/crear-usuarios-empresa.js');
        console.log('Si falla login, reinicia el servidor (límite de intentos).');
        process.exit(1);
    }

    const adminToken = tokens.admin;
    const vendedorToken = tokens.vendedor;
    const repartidorToken = tokens.repartidor;

    const clienteRes = await pool.query(
        'SELECT id, nombre FROM clientes ORDER BY id LIMIT 1'
    );
    const productoRes = await pool.query(
        `SELECT id, nombre, cantidad, precio_venta FROM productos
         WHERE activo IS NOT FALSE AND cantidad > 5 ORDER BY id LIMIT 1`
    );

    if (!clienteRes.rows[0] || !productoRes.rows[0]) {
        log('3. Datos base (cocina/producto)', false, 'Falta cliente o producto con stock');
        await pool.end();
        process.exit(1);
    }

    const clienteId = clienteRes.rows[0].id;
    const producto = productoRes.rows[0];
    log('3. Cocina y producto disponibles', true, `${clienteRes.rows[0].nombre} / ${producto.nombre}`);

    const creditoAntes = await request('GET', `/credito/cliente/${clienteId}`, null, adminToken);
    const saldoAntes = Number(creditoAntes.body.datos?.credito_debe || 0);

    const ventaCredito = await request('POST', '/ventas', {
        cliente_id: clienteId,
        tipo_pago: 'credito',
        productos: [{
            producto_id: producto.id,
            cantidad: 2,
            precio: Number(producto.precio_venta)
        }],
        canastos_entregados: 5,
        notas_entrega: 'Prueba flujo automático'
    }, vendedorToken);

    const ventaId = ventaCredito.body.datos?.id;
    log(
        '4. Pedido a crédito (vendedor)',
        ventaCredito.status === 201 && ventaCredito.body.exito,
        ventaId ? `Pedido #${ventaId}` : ventaCredito.body.mensaje
    );

    const creditoDespues = await request('GET', `/credito/cliente/${clienteId}`, null, adminToken);
    const saldoDespues = Number(creditoDespues.body.datos?.credito_debe || 0);
    const totalPedido = Number(ventaCredito.body.datos?.total || 0);
    log(
        '5. Deuda sumada automáticamente',
        saldoDespues >= saldoAntes + totalPedido - 0.01,
        `$${saldoAntes.toFixed(2)} → $${saldoDespues.toFixed(2)}`
    );

    const enRuta = await request('PATCH', `/entregas/${ventaId}`, { estado: 'en_ruta' }, repartidorToken);
    log(
        '6. Entrega en ruta (repartidor)',
        enRuta.status === 200 && enRuta.body.exito,
        enRuta.body.mensaje || `HTTP ${enRuta.status}`
    );

    const entregada = await request('PATCH', `/entregas/${ventaId}`, { estado: 'entregada' }, repartidorToken);
    log(
        '7. Entrega completada',
        entregada.status === 200 && entregada.body.exito,
        entregada.body.mensaje || `HTTP ${entregada.status}`
    );

    const abono = await request('POST', '/credito/abono', {
        cliente_id: clienteId,
        monto: Math.min(100, saldoDespues),
        notas: 'Pago prueba flujo'
    }, vendedorToken);
    log('8. Registro de pago parcial', abono.status === 201 && abono.body.exito, abono.body.mensaje);

    await pool.query('UPDATE clientes SET limite_credito = NULL WHERE id = $1', [clienteId]);

    const ventaCancel = await request('POST', '/ventas', {
        cliente_id: clienteId,
        tipo_pago: 'credito',
        productos: [{
            producto_id: producto.id,
            cantidad: 1,
            precio: Number(producto.precio_venta)
        }]
    }, vendedorToken);

    const cancelId = ventaCancel.body.datos?.id;
    const creditoPreCancel = Number(
        (await request('GET', `/credito/cliente/${clienteId}`, null, adminToken)).body.datos?.credito_debe || 0
    );

    const cancelar = await request('PATCH', `/entregas/${cancelId}`, { estado: 'cancelada' }, adminToken);
    const creditoPostCancel = Number(
        (await request('GET', `/credito/cliente/${clienteId}`, null, adminToken)).body.datos?.credito_debe || 0
    );

    log(
        '9. Cancelación revierte crédito',
        cancelar.body.exito && creditoPostCancel < creditoPreCancel,
        `#${cancelId} crédito $${creditoPreCancel.toFixed(2)} → $${creditoPostCancel.toFixed(2)}`
    );

    await pool.query(
        'UPDATE clientes SET limite_credito = 10 WHERE id = $1',
        [clienteId]
    );

    const saldoLimite = Number(
        (await request('GET', `/credito/cliente/${clienteId}`, null, adminToken)).body.datos?.credito_debe || 0
    );

    const ventaExceso = await request('POST', '/ventas', {
        cliente_id: clienteId,
        tipo_pago: 'credito',
        productos: [{
            producto_id: producto.id,
            cantidad: 5,
            precio: Number(producto.precio_venta)
        }]
    }, vendedorToken);

    log(
        '10. Bloqueo por límite de crédito',
        ventaExceso.status === 400 || ventaExceso.body.exito === false,
        ventaExceso.body.mensaje || `debe $${saldoLimite}, límite $10`
    );

    const reportes = await request('GET', `/reportes/dashboard`, null, adminToken);
    log('11. Reportes dashboard', reportes.status === 200 && reportes.body.exito);

    await pool.query('UPDATE clientes SET limite_credito = NULL WHERE id = $1', [clienteId]);

    console.log('\n=== RESUMEN ===');
    const passed = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);
    console.log(`${passed}/${results.length} pruebas OK`);
    if (failed.length) {
        failed.forEach((f) => console.log('  FALLÓ:', f.step, f.detail));
        process.exit(1);
    }
    console.log('\nSistema listo para operación diaria.');
    console.log('El administrador puede cargar cocinas reales cuando quiera.');

    await pool.end();
}

main().catch(async (e) => {
    console.error('ERROR:', e.message);
    try { await pool.end(); } catch { /* ignore */ }
    process.exit(1);
});
