/**
 * Fusiona clientes duplicados y deja campos de contacto vacíos para que el admin los complete.
 * Uso: node scripts/limpiar-clientes-duplicados.js
 */
require('../src/config/env');
const pool = require('../src/db');

const MANTENER_ID = 3;
const FUSIONAR_IDS = [2];
const ELIMINAR_IDS = [4];

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const dupId of FUSIONAR_IDS) {
            await client.query('UPDATE ventas SET cliente_id = $1 WHERE cliente_id = $2', [MANTENER_ID, dupId]);
            await client.query('UPDATE canastos_movimientos SET cliente_id = $1 WHERE cliente_id = $2', [MANTENER_ID, dupId]);
            await client.query('UPDATE credito_movimientos SET cliente_id = $1 WHERE cliente_id = $2', [MANTENER_ID, dupId]);
            await client.query('DELETE FROM clientes WHERE id = $1', [dupId]);
            console.log(`Fusionado cliente #${dupId} → #${MANTENER_ID}`);
        }

        for (const delId of ELIMINAR_IDS) {
            const check = await client.query(
                'SELECT COUNT(*)::int AS n FROM ventas WHERE cliente_id = $1',
                [delId]
            );
            if (check.rows[0].n > 0) {
                throw new Error(`Cliente #${delId} tiene ventas; no se puede eliminar`);
            }
            await client.query('DELETE FROM clientes WHERE id = $1', [delId]);
            console.log(`Eliminado cliente duplicado #${delId} (sin actividad)`);
        }

        await client.query(
            `UPDATE clientes SET
                direccion = '',
                telefono = '',
                contacto = '',
                horario_entrega = ''
             WHERE id = $1`,
            [MANTENER_ID]
        );
        console.log(`Cliente #${MANTENER_ID}: contacto vacío — listo para que el admin complete`);

        await client.query('COMMIT');

        const { rows } = await pool.query(
            `SELECT id, nombre, direccion, telefono,
                (SELECT COUNT(*)::int FROM ventas WHERE cliente_id = clientes.id) AS ventas
             FROM clientes ORDER BY id`
        );
        console.log('\nCocinas restantes:');
        rows.forEach((r) => {
            console.log(`  #${r.id} ${r.nombre} | ventas: ${r.ventas} | dir: "${r.direccion || '(pendiente)'}"`);
        });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
})().catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
});
