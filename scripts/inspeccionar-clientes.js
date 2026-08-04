require('../src/config/env');
const pool = require('../src/db');

(async () => {
    const clientes = await pool.query(`
        SELECT c.id, c.nombre, c.direccion, c.telefono, c.contacto, c.horario_entrega,
            (SELECT COUNT(*)::int FROM ventas v WHERE v.cliente_id = c.id) AS ventas,
            (SELECT COUNT(*)::int FROM canastos_movimientos m WHERE m.cliente_id = c.id) AS canastos,
            (SELECT COALESCE(SUM(CASE WHEN cr.tipo='cargo' THEN cr.monto ELSE -cr.monto END),0) FROM credito_movimientos cr WHERE cr.cliente_id = c.id) AS credito
        FROM clientes c ORDER BY c.nombre, c.id
    `);
    console.log(JSON.stringify(clientes.rows, null, 2));
    await pool.end();
})();
