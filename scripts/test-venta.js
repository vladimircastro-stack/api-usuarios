const http = require('http');
require('../src/config/env');

const BASE = 'http://localhost:3000';
const LOGIN = {
    correo: 'admin@empresa.com',
    password: 'secreto123'
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

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        if (payload) {
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
            });
        });

        req.on('error', reject);
        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

async function main() {
    console.log('=== PRUEBA DE VENTA ===\n');

    const login = await request('POST', '/login', LOGIN);
    console.log('1. Login ->', login.status, login.body.exito ? 'OK' : login.body);

    if (!login.body.token) {
        throw new Error('No se obtuvo token');
    }

    const token = login.body.token;
    console.log('   Rol:', login.body.usuario?.rol);

    const productoAntes = await request('GET', '/productos/2', null, token);
    console.log('\n2. Producto antes de venta (id=2):');
    console.log('   Nombre:', productoAntes.body.datos?.nombre);
    console.log('   Cantidad:', productoAntes.body.datos?.cantidad);
    console.log('   Precio venta:', productoAntes.body.datos?.precio_venta);

    const venta = await request(
        'POST',
        '/ventas',
        {
            cliente_id: 2,
            productos: [{ producto_id: 2, cantidad: 1 }]
        },
        token
    );

    console.log('\n3. Crear venta ->', venta.status);
    console.log('   Respuesta:', venta.body);

    const productoDespues = await request('GET', '/productos/2', null, token);
    console.log('\n4. Producto despues de venta:');
    console.log('   Cantidad:', productoDespues.body.datos?.cantidad);

    const ventas = await request('GET', '/ventas', null, token);
    console.log('\n5. Listado ventas ->', ventas.status);
    console.log('   Total ventas:', ventas.body.datos?.length);
    console.log('   Ultima venta:', ventas.body.datos?.[0]);

    const ok = venta.status === 201 && venta.body.exito === true;
    console.log('\n=== RESULTADO:', ok ? 'VENTA CREADA CORRECTAMENTE' : 'FALLO', '===');
}

main().catch((error) => {
    console.error('ERROR:', error.message);
    process.exit(1);
});
