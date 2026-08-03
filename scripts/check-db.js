require('../src/config/env');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function main() {
    const db = await pool.query('SELECT current_database() AS name');
    console.log('Base de datos conectada:', db.rows[0].name);

    const tables = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    `);

    if (tables.rows.length === 0) {
        console.log('Tablas: (ninguna - falta ejecutar schema.sql)');
    } else {
        console.log('Tablas:', tables.rows.map((r) => r.table_name).join(', '));
    }

    await pool.end();
}

main().catch((error) => {
    console.error('ERROR:', error.message);
    process.exit(1);
});
