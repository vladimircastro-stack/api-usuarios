/**
 * Completa dirección, teléfono y horario de cocinas que no los tengan.
 * Uso: node scripts/completar-datos-cocinas.js
 */
require('../src/config/env');
const pool = require('../src/db');

const datosPorNombre = {
    'cocina': { direccion: 'Calle Principal, Neyba', telefono: '809-000-0000', horario_entrega: 'Lun-Vie 6:00-10:00' }
};

const actualizarSiFalta = async (client, id, nombre, campos) => {
    const sets = [];
    const vals = [];
    let i = 1;

    for (const [key, val] of Object.entries(campos)) {
        if (val == null || val === '') continue;
        sets.push(`${key} = COALESCE(NULLIF(TRIM(${key}), ''), $${i})`);
        vals.push(val);
        i += 1;
    }

    if (sets.length === 0) return;

    vals.push(id);
    await client.query(
        `UPDATE clientes SET ${sets.join(', ')} WHERE id = $${i}`,
        vals
    );
    console.log(`  OK: ${nombre}`);
};

const main = async () => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `SELECT id, nombre, direccion, telefono, contacto, horario_entrega FROM clientes ORDER BY id`
        );

        if (rows.length === 0) {
            console.log('No hay clientes en la base de datos.');
            return;
        }

        console.log(`Actualizando ${rows.length} cocina(s)...`);

        for (const row of rows) {
            const base = {
                direccion: row.direccion?.trim() || `Zona industrial, Neyba (cerca de ${row.nombre})`,
                telefono: row.telefono?.trim() || '809-555-0100',
                horario_entrega: row.horario_entrega?.trim() || 'Lun-Sáb 5:30-11:00',
                contacto: row.contacto?.trim() || 'Encargado de cocina'
            };

            await actualizarSiFalta(client, row.id, row.nombre, base);
        }

        console.log('Datos de cocinas completados.');
    } finally {
        client.release();
        await pool.end();
    }
};

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
