const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esCorreoValido = (correo) => CORREO_REGEX.test(correo);

const esEnteroPositivo = (valor) => {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0;
};

const esNumeroNoNegativo = (valor) => {
    const numero = Number(valor);
    return !Number.isNaN(numero) && numero >= 0;
};

const esNumeroPositivo = (valor) => {
    const numero = Number(valor);
    return !Number.isNaN(numero) && numero > 0;
};

const normalizarCorreo = (correo) => correo.trim().toLowerCase();

const normalizarTexto = (texto) => texto.trim();

module.exports = {
    CORREO_REGEX,
    esCorreoValido,
    esEnteroPositivo,
    esNumeroNoNegativo,
    esNumeroPositivo,
    normalizarCorreo,
    normalizarTexto
};
