const AppError = require('../utils/AppError');
const { esCorreoValido, normalizarCorreo, normalizarTexto } = require('../utils/validators');

const validarCliente = (req, res, next) => {
    const { nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite_credito } = req.body || {};

    if (!nombre || normalizarTexto(nombre) === '') {
        return next(new AppError('El nombre del cliente es obligatorio', 400));
    }

    if (correo && correo.trim() !== '' && !esCorreoValido(correo)) {
        return next(new AppError('El correo no tiene un formato valido (ej. cocina@email.com). Dejelo vacio si no tiene.', 400));
    }

    if (limite_credito != null && limite_credito !== '') {
        const limite = Number(limite_credito);
        if (Number.isNaN(limite) || limite < 0) {
            return next(new AppError('El límite de crédito debe ser un número mayor o igual a 0', 400));
        }
        if (req.usuario?.rol !== 'admin') {
            return next(new AppError('Solo el administrador puede definir el límite de crédito', 403));
        }
        req.body.limite_credito = limite;
    } else if (req.usuario?.rol === 'admin' && limite_credito === '') {
        req.body.limite_credito = null;
    } else {
        delete req.body.limite_credito;
    }

    req.body.nombre = normalizarTexto(nombre);
    req.body.telefono = telefono ? normalizarTexto(telefono) : null;
    req.body.correo = correo ? normalizarCorreo(correo) : null;
    req.body.direccion = direccion ? normalizarTexto(direccion) : null;
    req.body.tipo = tipo ? normalizarTexto(tipo) : 'cocina_industrial';
    req.body.contacto = contacto ? normalizarTexto(contacto) : null;
    req.body.horario_entrega = horario_entrega ? normalizarTexto(horario_entrega) : null;

    return next();
};

module.exports = validarCliente;
