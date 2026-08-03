const app = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Documentación Swagger: http://localhost:${PORT}/api-docs`);
});

const shutdown = async (signal) => {
    console.log(`Recibida señal ${signal}. Cerrando servidor...`);

    server.close(async () => {
        try {
            await pool.end();
            console.log('Pool de PostgreSQL cerrado');
        } catch (error) {
            console.error('Error al cerrar el pool:', error);
        }

        console.log('Servidor detenido correctamente');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
