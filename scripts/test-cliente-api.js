require('../src/config/env');
const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: '127.0.0.1',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                let parsed = {};
                try { parsed = JSON.parse(raw); } catch {}
                resolve({ status: res.statusCode, body: parsed, raw });
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    const login = await request('POST', '/login', {
        correo: 'vladimirnuevo@gmail.com',
        password: 'RYVAdmin2026!'
    });
    console.log('LOGIN', login.status, login.body.mensaje || login.body.token?.slice(0, 20));
    if (!login.body.token) process.exit(1);

    const token = login.body.token;
    const create = await request('POST', '/clientes', {
        nombre: 'Cocina Prueba API',
        telefono: '8091234567',
        correo: '',
        direccion: 'Neyba',
        contacto: 'Maria',
        horario_entrega: '7am-12m',
        limite_credito: ''
    }, token);
    console.log('CREATE', create.status, create.body.mensaje || create.raw);

    const list = await request('GET', '/clientes', null, token);
    console.log('LIST', list.status, list.body.mensaje || list.raw?.slice(0, 200));

    if (create.body.datos?.id) {
        await request('DELETE', `/clientes/${create.body.datos.id}`, null, token);
    }
})();
