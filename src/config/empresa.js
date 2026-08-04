const { getPrecioCanasto } = require('../models/configModel');

const valorCanastos = (cantidad) => {
    const n = Number(cantidad) || 0;
    return Math.round(n * getPrecioCanasto() * 100) / 100;
};

module.exports = {
    get PRECIO_CANASTO() {
        return getPrecioCanasto();
    },
    getPrecioCanasto,
    valorCanastos
};
