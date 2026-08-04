/**
 * Simula la prueba manual del repartidor y vendedor (mismos pasos que en pantalla).
 * node scripts/prueba-manual-ui.js
 */
const http = require('http');

const USERS = {
    repartidor: { correo: 'repartidor@ryvfrutas.com', password: 'RYVReparto2026!' },
    vendedor: { correo: 'vendedor@ryvfrutas.com', password: 'RYVVende2026!' }
};

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

async function login(user) {
    const res = await request('POST', '/login', user);
    return { token: res.body.token, rol: res.body.usuario?.rol, ok: !!res.body.token, msg: res.body.mensaje };
}

async function main() {
    console.log('=== PRUEBA MANUAL (flujo pantalla) ===\n');

    console.log('--- REPARTIDOR ---');
    const rep = await login(USERS.repartidor);
    console.log(rep.ok ? `OK Login repartidor (${rep.rol})` : `FAIL Login: ${rep.msg}`);
    if (!rep.token) process.exit(1);

    const entregas = await request('GET', '/entregas', null, rep.token);
    const lista = entregas.body.datos || [];
    console.log(`OK Entregas visibles: ${lista.length} pedidos`);

    const hoy = await request('GET', '/entregas?hoy=1', null, rep.token);
    const hoyLista = hoy.body.datos || [];
    console.log(`OK Pestaña Hoy (API ?hoy=1): ${hoyLista.length} pedidos`);

    const pendiente = lista.find((e) => (e.estado_entrega || 'pendiente') === 'pendiente');
    if (!pendiente) {
        console.log('AVISO: no hay pedido pendiente para marcar en ruta');
    } else {
        const id = pendiente.id;
        console.log(`\nPedido de prueba #${id} — ${pendiente.cliente || ''} — $${pendiente.total}`);

        const enRuta = await request('PATCH', `/entregas/${id}`, { estado: 'en_ruta' }, rep.token);
        console.log(enRuta.body.exito ? `OK Clic "En ruta"` : `FAIL En ruta: ${enRuta.body.mensaje}`);

        const entregada = await request('PATCH', `/entregas/${id}`, { estado: 'entregada' }, rep.token);
        console.log(entregada.body.exito ? `OK Clic "Entregada"` : `FAIL Entregada: ${entregada.body.mensaje}`);

        const detalle = await request('GET', `/ventas/${id}`, null, rep.token);
        const v = detalle.body.datos?.venta || detalle.body.datos;
        console.log(`OK Estado final: ${v?.estado_entrega}`);
        if (v?.cliente_direccion) console.log(`   Dirección: ${v.cliente_direccion}`);
        if (v?.cliente_telefono) console.log(`   Teléfono: ${v.cliente_telefono}`);
    }

    const rutasBloqueadas = await Promise.all([
        request('GET', '/config', null, rep.token),
        request('GET', '/usuarios', null, rep.token)
    ]);
    const sinConfig = rutasBloqueadas[0].status === 403 || rutasBloqueadas[0].body.exito === false;
    const sinUsuarios = rutasBloqueadas[1].status === 403 || rutasBloqueadas[1].body.exito === false;
    console.log(sinConfig && sinUsuarios ? 'OK Repartidor NO accede a Config/Usuarios' : 'FAIL Permisos repartidor');

    console.log('\n--- VENDEDOR ---');
    const ven = await login(USERS.vendedor);
    console.log(ven.ok ? `OK Login vendedor (${ven.rol})` : `FAIL Login: ${ven.msg}`);

    const pedidos = await request('GET', '/ventas', null, ven.token);
    console.log(`OK Pedidos visibles: ${(pedidos.body.datos || []).length}`);

    const credito = await request('GET', '/credito/resumen', null, ven.token);
    console.log(credito.body.exito
        ? `OK Cuentas/crédito: $${Number(credito.body.datos?.total_pendiente || 0).toFixed(2)} pendiente`
        : `FAIL Cuentas: ${credito.body.mensaje}`);

    const sinUsuariosVen = (await request('GET', '/usuarios', null, ven.token)).status === 403;
    console.log(sinUsuariosVen ? 'OK Vendedor NO accede a Usuarios' : 'FAIL Permisos vendedor');

    console.log('\n=== PRUEBA MANUAL COMPLETADA ===');
    console.log('En navegador: repartidor@ryvfrutas.com → Entregas → Hoy → En ruta → Entregada');
}

main().catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
