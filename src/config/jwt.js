require('./env');

const secret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
}

module.exports = {
    secret,
    expires: process.env.JWT_EXPIRES_IN || '24h'
};
