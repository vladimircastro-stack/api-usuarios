require('../src/config/env');
const http = require('http');

const body = JSON.stringify({
    correo: process.env.PRUEBA_VENDEDOR || 'vendedor@ryvfrutas.com',
    password: process.env.PRUEBA_VENDEDOR_PASS || 'RYVVende2026!'
});

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    }
}, (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => {
        const json = JSON.parse(data);
        if (!json.token) {
            console.error(json.mensaje || 'Sin token');
            process.exit(1);
        }
        process.stdout.write(json.token);
    });
});

req.write(body);
req.end();
