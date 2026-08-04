const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    obtenerClientes,
    buscarClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../models/clientesModel');

const parseLimite = (body) => {
    if (body.limite_credito === undefined) return undefined;
    if (body.limite_credito === null || body.limite_credito === '') return null;
    return Number(body.limite_credito);
};

const mostrarClientes = asyncHandler(async (req, res) => {
    const clientes = await obtenerClientes();
    sendSuccess(res, {
        mensaje: 'Clientes encontrados correctamente',
        datos: clientes
    });
});

const buscarCliente = asyncHandler(async (req, res) => {
    const cliente = await buscarClientePorId(req.params.id);

    if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Cliente encontrado correctamente',
        datos: cliente
    });
});

const crearClienteController = asyncHandler(async (req, res) => {
    const { nombre, telefono, correo, direccion, tipo, contacto, horario_entrega } = req.body;
    const limite = req.usuario.rol === 'admin' && req.body.limite_credito !== undefined
        ? parseLimite(req.body)
        : null;
    const cliente = await crearCliente(
        nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite
    );

    sendSuccess(res, {
        mensaje: 'Cliente creado correctamente',
        datos: cliente,
        statusCode: 201
    });
});

const actualizarClienteController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion, tipo, contacto, horario_entrega } = req.body;

    const actual = await buscarClientePorId(id);
    if (!actual) {
        throw new AppError('Cliente no encontrado', 404);
    }

    let limite = actual.limite_credito != null ? Number(actual.limite_credito) : null;
    if (req.usuario.rol === 'admin' && req.body.limite_credito !== undefined) {
        limite = parseLimite(req.body);
    }

    const cliente = await actualizarCliente(
        id, nombre, telefono, correo, direccion, tipo, contacto, horario_entrega, limite
    );

    sendSuccess(res, {
        mensaje: 'Cliente actualizado correctamente',
        datos: cliente
    });
});

const eliminarClienteController = asyncHandler(async (req, res) => {
    const cliente = await eliminarCliente(req.params.id);

    if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Cliente eliminado correctamente',
        datos: cliente
    });
});

module.exports = {
    mostrarClientes,
    buscarCliente,
    crearCliente: crearClienteController,
    actualizarCliente: actualizarClienteController,
    eliminarCliente: eliminarClienteController
};
