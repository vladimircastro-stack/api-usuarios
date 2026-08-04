require('../src/config/env');
const fs = require('fs');
const path = require('path');
const pool = require('../src/db');

const migrationsDir = path.join(__dirname, '../database/migrations');

async function run() {
    const files = fs.readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        console.log(`Aplicando ${file}...`);
        await pool.query(sql);
        console.log(`  OK: ${file}`);
    }

    console.log('Todas las migraciones aplicadas.');
}

run()
    .catch((error) => {
        console.error('Error al aplicar migración:', error.message);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        process.exit(0);
    });
