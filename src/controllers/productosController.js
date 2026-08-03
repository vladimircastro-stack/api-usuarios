const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    obtenerProductos,
    buscarProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../models/productosModel');

const mostrarProductos = asyncHandler(async (req, res) => {
    const productos = await obtenerProductos();
    sendSuccess(res, {
        mensaje: 'Productos encontrados correctamente',
        datos: productos
    });
});

const buscarProducto = asyncHandler(async (req, res) => {
    const producto = await buscarProductoPorId(req.params.id);

    if (!producto) {
        throw new AppError('Producto no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Producto encontrado correctamente',
        datos: producto
    });
});

const crearProductoController = asyncHandler(async (req, res) => {
    const {
        nombre,
        categoria,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta
    } = req.body;

    const producto = await crearProducto(
        nombre,
        categoria,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta
    );

    sendSuccess(res, {
        mensaje: 'Producto creado correctamente',
        datos: producto,
        statusCode: 201
    });
});

const actualizarProductoController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        categoria,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta
    } = req.body;

    const producto = await actualizarProducto(
        id,
        nombre,
        categoria,
        unidad_medida,
        cantidad,
        precio_compra,
        precio_venta
    );

    if (!producto) {
        throw new AppError('Producto no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Producto actualizado correctamente',
        datos: producto
    });
});

const eliminarProductoController = asyncHandler(async (req, res) => {
    const producto = await eliminarProducto(req.params.id);

    if (!producto) {
        throw new AppError('Producto no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Producto eliminado correctamente',
        datos: producto
    });
});

module.exports = {
    mostrarProductos,
    buscarProducto,
    crearProducto: crearProductoController,
    actualizarProducto: actualizarProductoController,
    eliminarProducto: eliminarProductoController
};
