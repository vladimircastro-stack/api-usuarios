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
const inventarioRoutes = require('./routes/inventarioRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const entregasRoutes = require('./routes/entregasRoutes');
const canastosRoutes = require('./routes/canastosRoutes');
const creditoRoutes = require('./routes/creditoRoutes');
const configRoutes = require('./routes/configRoutes');
const { loadCache } = require('./models/configModel');
const path = require('path');
const fs = require('fs');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/response');

require('./docs/openapi.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        return sendSuccess(res, {
            mensaje: 'API funcionando correctamente',
            datos: { status: 'ok', database: 'connected' }
        });
    } catch (error) {
        return res.status(503).json({
            exito: false,
            mensaje: 'Base de datos no disponible',
            datos: { status: 'degraded', database: 'disconnected' }
        });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => {
        res.json(swaggerSpec);
    });
}

app.use('/', usuariosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/reportes', reportesRoutes);
app.use('/entregas', entregasRoutes);
app.use('/canastos', canastosRoutes);
app.use('/credito', creditoRoutes);
app.use('/config', configRoutes);

const frontendCandidates = [
    path.join(__dirname, '../../frontend/dist'),
    path.join(__dirname, '../public')
];
const frontendDist = frontendCandidates.find((candidate) => fs.existsSync(candidate));

if (frontendDist) {
    app.use(express.static(frontendDist));
    app.get(/^\/(?!api-docs|health).*/, (req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('VC DistribuidorPro API funcionando. Ejecute npm run build:frontend para la aplicación web.');
    });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
