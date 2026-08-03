const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const requiredVars = [
    'DB_USER',
    'DB_HOST',
    'DB_NAME',
    'DB_PASSWORD',
    'DB_PORT',
    'JWT_SECRET'
];

const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
}

module.exports = process.env;
