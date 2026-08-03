const http = require('http');

const BASE = 'http://localhost:3000';
const TEST_USER = {
    nombre: 'Admin Empresa',
    correo: 'admin@empresa.com',
    edad: 30,
    password: 'secreto123'
};

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const payload = body ? JSON.stringify(body) : null;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
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
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (error) {
                    json = { raw: data };
                }
                resolve({ status: res.statusCode, body: json });
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
    const results = [];

    console.log('=== PRUEBAS SGCRD API ===\n');

    const health = await request('GET', '/health');
    results.push(['GET /health', health.status, health.body.exito]);
    console.log('1. GET /health ->', health.status, health.body);

    const root = await request('GET', '/');
    results.push(['GET /', root.status, typeof root.body.raw === 'string']);
    console.log('2. GET / ->', root.status, root.body.raw || root.body);

    const register = await request('POST', '/usuarios', TEST_USER);
    results.push(['POST /usuarios', register.status, register.body.exito]);
    console.log('3. POST /usuarios ->', register.status, register.body);

    const loginBad = await request('POST', '/login', {
        correo: TEST_USER.correo,
        password: 'incorrecta'
    });
    results.push(['POST /login (mala pass)', loginBad.status, loginBad.body.mensaje]);
    console.log('4. POST /login credenciales invalidas ->', loginBad.status, loginBad.body);

    const login = await request('POST', '/login', {
        correo: TEST_USER.correo,
        password: TEST_USER.password
    });
    results.push(['POST /login', login.status, !!login.body.token]);
    console.log('5. POST /login ->', login.status, {
        exito: login.body.exito,
        rol: login.body.usuario?.rol,
        token: login.body.token ? 'recibido' : 'no'
    });

    const token = login.body.token;

    const profile = await request('GET', '/perfil', null, token);
    results.push(['GET /perfil', profile.status, profile.body.exito]);
    console.log('6. GET /perfil ->', profile.status, profile.body);

    const clientes = await request('GET', '/clientes', null, token);
    results.push(['GET /clientes', clientes.status, clientes.body.exito]);
    console.log('7. GET /clientes ->', clientes.status, clientes.body);

    const productos = await request('GET', '/productos', null, token);
    results.push(['GET /productos', productos.status, productos.body.exito]);
    console.log('8. GET /productos ->', productos.status, productos.body);

    console.log('\n=== RESUMEN ===');
    results.forEach(([name, status, ok]) => {
        console.log(`${ok ? 'OK' : 'FAIL'} | ${name} | HTTP ${status}`);
    });

    if (!token) {
        console.log('\nNo se obtuvo token; omitiendo prueba de admin.');
        return;
    }

    require('../src/config/env');
    const { Pool } = require('pg');
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    await pool.query(
        'UPDATE usuarios SET rol = $1 WHERE correo = $2',
        ['admin', TEST_USER.correo]
    );

    const loginAdmin = await request('POST', '/login', {
        correo: TEST_USER.correo,
        password: TEST_USER.password
    });

    console.log('\n9. Usuario promovido a admin ->', loginAdmin.body.usuario?.rol);

    const adminToken = loginAdmin.body.token;
    const adminZone = await request('GET', '/admin', null, adminToken);
    results.push(['GET /admin', adminZone.status, adminZone.body.exito]);
    console.log('10. GET /admin ->', adminZone.status, adminZone.body);

    await pool.end();
}

main().catch((error) => {
    console.error('ERROR EN PRUEBAS:', error.message);
    process.exit(1);
});
