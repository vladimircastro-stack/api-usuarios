const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    obtenerConexion,
    obtenerVentas,
    buscarVentaPorId,
    crearVenta,
    crearDetalleVenta,
    buscarClientePorIdConCliente
} = require('../models/ventasModel');
const { buscarProductoPorIdConCliente, descontarInventario } = require('../models/productosModel');

const mostrarVentas = asyncHandler(async (req, res) => {
    const ventas = await obtenerVentas();
    sendSuccess(res, {
        mensaje: 'Ventas encontradas correctamente',
        datos: ventas
    });
});

const buscarVenta = asyncHandler(async (req, res) => {
    const venta = await buscarVentaPorId(req.params.id);

    if (!venta.venta) {
        throw new AppError('Venta no encontrada', 404);
    }

    sendSuccess(res, {
        mensaje: 'Venta encontrada correctamente',
        datos: venta
    });
});

const crearVentaController = asyncHandler(async (req, res) => {
    const client = await obtenerConexion();

    try {
        await client.query('BEGIN');

        const { cliente_id, productos } = req.body;
        const usuario_id = req.usuario.id;

        const cliente = await buscarClientePorIdConCliente(client, cliente_id);

        if (!cliente) {
            throw new AppError('Cliente no encontrado', 404);
        }

        let total = 0;
        const lineas = [];

        for (const item of productos) {
            const productoDb = await buscarProductoPorIdConCliente(client, item.producto_id);

            if (!productoDb) {
                throw new AppError(`Producto ${item.producto_id} no encontrado`, 404);
            }

            const precio = Number(productoDb.precio_venta);
            const cantidad = Number(item.cantidad);
            const subtotal = Number((precio * cantidad).toFixed(2));

            lineas.push({
                producto_id: item.producto_id,
                cantidad,
                precio,
                subtotal
            });

            total += subtotal;
        }

        total = Number(total.toFixed(2));

        const venta = await crearVenta(client, cliente_id, usuario_id, total);

        for (const linea of lineas) {
            await crearDetalleVenta(
                client,
                venta.id,
                linea.producto_id,
                linea.cantidad,
                linea.precio,
                linea.subtotal
            );

            const inventario = await descontarInventario(
                client,
                linea.producto_id,
                linea.cantidad
            );

            if (!inventario) {
                throw new AppError(
                    `Inventario insuficiente para el producto ${linea.producto_id}`,
                    400
                );
            }
        }

        await client.query('COMMIT');

        sendSuccess(res, {
            mensaje: 'Venta creada correctamente',
            datos: venta,
            statusCode: 201
        });
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

module.exports = {
    mostrarVentas,
    buscarVenta,
    crearVenta: crearVentaController
};
