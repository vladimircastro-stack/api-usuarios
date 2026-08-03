require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const pool = require('./db');
const swaggerSpec = require('./config/swagger');
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientesRoutes');
const productosRoutes = require('./routes/productosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/response');

require('./docs/openapi.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        exito: false,
        mensaje: 'Demasiadas solicitudes, intente más tarde'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_AUTH_MAX || 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        exito: false,
        mensaje: 'Demasiados intentos de autenticación, intente más tarde'
    }
});

app.use(generalLimiter);
app.use('/login', authLimiter);
app.use('/usuarios', (req, res, next) => {
    if (req.method === 'POST') {
        return authLimiter(req, res, next);
    }
    return next();
});

app.get('/health', async (req, res, next) => {
    try {
        await pool.query('SELECT 1');
        sendSuccess(res, {
            mensaje: 'API funcionando correctamente',
            datos: {
                status: 'ok',
                database: 'connected'
            }
        });
    } catch (error) {
        sendSuccess(res, {
            mensaje: 'API en ejecución con base de datos no disponible',
            datos: {
                status: 'degraded',
                database: 'disconnected'
            }
        });
    }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/', usuariosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);

app.get('/', (req, res) => {
    res.send('API SGCRD funcionando. Documentación en /api-docs');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
