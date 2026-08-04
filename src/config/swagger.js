const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'VC DistribuidorPro API',
            version: '1.0.0',
            description:
                'API REST para gestión de usuarios, clientes, productos y ventas con autenticación JWT.'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Desarrollo local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                RespuestaExito: {
                    type: 'object',
                    properties: {
                        exito: { type: 'boolean', example: true },
                        mensaje: { type: 'string' },
                        datos: { type: 'object' }
                    }
                },
                RespuestaError: {
                    type: 'object',
                    properties: {
                        exito: { type: 'boolean', example: false },
                        mensaje: { type: 'string' }
                    }
                }
            }
        },
        tags: [
            { name: 'Sistema', description: 'Estado del servicio' },
            { name: 'Usuarios', description: 'Registro, login y gestión de usuarios' },
            { name: 'Clientes', description: 'CRUD de clientes' },
            { name: 'Productos', description: 'CRUD de productos e inventario' },
            { name: 'Ventas', description: 'Registro y consulta de ventas' }
        ]
    },
    apis: ['./src/routes/*.js', './src/docs/*.js']
};

module.exports = swaggerJsdoc(options);
