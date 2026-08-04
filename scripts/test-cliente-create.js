require('../src/config/env');
const pool = require('../src/db');

(async () => {
    try {
        const { crearCliente, obtenerClientes } = require('../src/models/clientesModel');
        const c = await crearCliente('Test Cocina Debug', '8095550000', '', 'Calle Test', 'cocina_industrial', 'Juan', '8am', null);
        console.log('INSERT OK', c.id);
        const list = await obtenerClientes();
        console.log('LIST OK', list.length);
        await pool.query('DELETE FROM clientes WHERE id = $1', [c.id]);
        console.log('ALL OK');
    } catch (e) {
        console.error('FAIL', e.message);
        console.error(e.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
})();
