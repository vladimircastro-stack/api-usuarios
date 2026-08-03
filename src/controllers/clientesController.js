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
    const { nombre, telefono, correo, direccion } = req.body;
    const cliente = await crearCliente(nombre, telefono, correo, direccion);

    sendSuccess(res, {
        mensaje: 'Cliente creado correctamente',
        datos: cliente,
        statusCode: 201
    });
});

const actualizarClienteController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion } = req.body;
    const cliente = await actualizarCliente(id, nombre, telefono, correo, direccion);

    if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
    }

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
