/**
 * Crea usuarios del equipo RYV Frutas del Caribe y actualiza contraseña del admin.
 * Ejecutar: node scripts/crear-usuarios-empresa.js
 */
require('../src/config/env');
const bcrypt = require('bcrypt');
const pool = require('../src/db');

const EQUIPO = [
    {
        nombre: 'Administrador RYV',
        correo: 'admin@ryvfrutas.com',
        edad: 35,
        password: 'RYVAdmin2026!',
        rol: 'admin'
    },
    {
        nombre: 'Vendedor RYV',
        correo: 'vendedor@ryvfrutas.com',
        edad: 28,
        password: 'RYVVende2026!',
        rol: 'vendedor'
    },
    {
        nombre: 'Repartidor RYV',
        correo: 'repartidor@ryvfrutas.com',
        edad: 32,
        password: 'RYVReparto2026!',
        rol: 'repartidor'
    },
    {
        nombre: 'Almacén RYV',
        correo: 'almacen@ryvfrutas.com',
        edad: 30,
        password: 'RYVStock2026!',
        rol: 'almacen'
    }
];

/** Admin principal existente — nueva contraseña */
const ADMIN_PRINCIPAL = {
    correo: 'vladimirnuevo@gmail.com',
    password: 'RYVAdmin2026!'
};

async function upsertUsuario({ nombre, correo, edad, password, rol }) {
    const hash = await bcrypt.hash(password, 10);
    const existente = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);

    if (existente.rows[0]) {
        await pool.query(
            `UPDATE usuarios SET nombre = $1, edad = $2, password = $3, rol = $4 WHERE correo = $5`,
            [nombre, edad, hash, rol, correo]
        );
        return { correo, rol, accion: 'actualizado' };
    }

    await pool.query(
        `INSERT INTO usuarios (nombre, correo, edad, password, rol) VALUES ($1, $2, $3, $4, $5)`,
        [nombre, correo, edad, hash, rol]
    );
    return { correo, rol, accion: 'creado' };
}

async function main() {
    console.log('=== Usuarios equipo RYV Frutas del Caribe ===\n');

    const adminHash = await bcrypt.hash(ADMIN_PRINCIPAL.password, 10);
    const adminUpd = await pool.query(
        'UPDATE usuarios SET password = $1, rol = $2 WHERE correo = $3 RETURNING nombre, correo',
        [adminHash, 'admin', ADMIN_PRINCIPAL.correo]
    );

    if (adminUpd.rows[0]) {
        console.log(`Admin principal actualizado: ${adminUpd.rows[0].correo}`);
    } else {
        console.log('AVISO: no se encontró', ADMIN_PRINCIPAL.correo);
    }

    for (const u of EQUIPO) {
        const r = await upsertUsuario(u);
        console.log(`${r.accion}: ${r.correo} (${r.rol})`);
    }

    const lista = await pool.query(
        'SELECT nombre, correo, rol FROM usuarios WHERE correo LIKE $1 OR correo = $2 ORDER BY rol, correo',
        ['%@ryvfrutas.com', ADMIN_PRINCIPAL.correo]
    );

    console.log('\n--- Credenciales (cambiar después del primer uso) ---');
    console.log(`Admin:      ${ADMIN_PRINCIPAL.correo} / ${ADMIN_PRINCIPAL.password}`);
    EQUIPO.forEach((u) => console.log(`${u.rol.padEnd(11)} ${u.correo} / ${u.password}`));
    console.log('\nVer detalle en: USUARIOS-EMPRESA.md');

    await pool.end();
}

main().catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
});
