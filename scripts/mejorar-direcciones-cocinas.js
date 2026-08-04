require('../src/config/env');
const pool = require('../src/db');

const mejoras = [
    { match: 'Juan Pérez', direccion: 'Av. Hermanas Mirabal, Neyba, Bahoruco', telefono: '809-555-1234', contacto: 'Juan Pérez', horario_entrega: 'Lun-Vie 6:00-9:30' },
    { match: 'Juan Perez', direccion: 'Calle Duarte #45, Neyba, Bahoruco', telefono: '809-111-1111', contacto: 'Encargado cocina', horario_entrega: 'Lun-Sáb 5:30-10:00' }
];

(async () => {
    for (const m of mejoras) {
        await pool.query(
            `UPDATE clientes SET
                direccion = $1,
                telefono = COALESCE(NULLIF(TRIM(telefono), ''), $2),
                contacto = COALESCE(NULLIF(TRIM(contacto), ''), $3),
                horario_entrega = COALESCE(NULLIF(TRIM(horario_entrega), ''), $4)
             WHERE nombre ILIKE $5`,
            [m.direccion, m.telefono, m.contacto, m.horario_entrega, m.match]
        );
    }
    const { rows } = await pool.query('SELECT id, nombre, direccion, telefono FROM clientes ORDER BY id');
    rows.forEach((r) => console.log(`${r.id}. ${r.nombre} | ${r.direccion} | ${r.telefono}`));
    await pool.end();
})();
