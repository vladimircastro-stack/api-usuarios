require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');

const correo = process.argv[2] || 'admin@ryvfrutas.com';
const password = process.argv[3] || 'RYVAdmin2026!';

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const req = http.request(
            {
                hostname: 'localhost',
                port: Number(process.env.PORT) || 3000,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
                }
            },
            (res) => {
                let data = '';
                res.on('data', (c) => (data += c));
                res.on('end', () => {
                    let json = {};
                    try {
                        json = JSON.parse(data);
                    } catch {
                        json = { raw: data };
                    }
                    resolve({ status: res.statusCode, json });
                });
            }
        );
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function main() {
    const login = await request('POST', '/login', { correo, password });
    console.log('LOGIN', login.status, login.json.mensaje || login.json);
    const token = login.json.token || login.json.datos?.token;
    if (!token) process.exit(1);

    for (const path of ['/canastos/resumen', '/canastos/pendientes', '/canastos/movimientos', '/clientes', '/productos']) {
        const r = await request('GET', path, null, token);
        console.log(path, r.status, r.status === 200 ? 'OK' : r.json.mensaje || r.json);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
