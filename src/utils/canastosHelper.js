const { PRECIO_CANASTO, valorCanastos } = require('../config/empresa');

const enriquecerCanastos = (cantidad) => ({
    canastos_debe: Number(cantidad) || 0,
    canastos_valor_debe: valorCanastos(cantidad),
    precio_canasto: PRECIO_CANASTO
});

module.exports = { PRECIO_CANASTO, valorCanastos, enriquecerCanastos };
