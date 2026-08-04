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
const { registrarMovimiento } = require('../models/inventarioModel');
const { registrarMovimiento: registrarCanastos } = require('../models/canastosModel');
const { registrarMovimiento: registrarCredito, saldoCliente } = require('../models/creditoModel');
const { buscarClientePorId } = require('../models/clientesModel');

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

        const {
            cliente_id,
            productos,
            fecha_entrega_programada,
            notas_entrega,
            canastos_entregados,
            tipo_pago
        } = req.body;
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

            if (productoDb.activo === false) {
                throw new AppError(`Producto ${productoDb.nombre} no está activo`, 400);
            }

            if (item.precio == null || item.precio === '') {
                throw new AppError(`Indique el precio en factura para ${productoDb.nombre}`, 400);
            }

            const precio = Number(item.precio);
            if (precio <= 0) {
                throw new AppError(`Precio inválido para ${productoDb.nombre}`, 400);
            }
            const cantidad = Number(item.cantidad);
            const subtotal = Number((precio * cantidad).toFixed(2));
            const unidadVenta = item.unidad_venta || productoDb.unidad_medida;
            const descontar = item.descontar_inventario !== false;
            const cantidadInventario = item.cantidad_inventario != null
                ? Number(item.cantidad_inventario)
                : cantidad;

            lineas.push({
                producto_id: item.producto_id,
                cantidad,
                precio,
                subtotal,
                nombre: productoDb.nombre,
                descripcion: item.descripcion || null,
                unidad_venta: unidadVenta,
                cantidad_inventario: cantidadInventario,
                descontar
            });

            total += subtotal;
        }

        total = Number(total.toFixed(2));

        const pago = tipo_pago === 'credito' ? 'credito' : 'contado';

        if (pago === 'credito') {
            const clienteDb = await buscarClientePorId(cliente_id);
            const limite = clienteDb?.limite_credito != null ? Number(clienteDb.limite_credito) : null;
            if (limite != null && limite >= 0) {
                const debe = await saldoCliente(cliente_id);
                if (debe + total > limite) {
                    throw new AppError(
                        `Límite de crédito excedido. Debe $${debe.toFixed(2)}, límite $${limite.toFixed(2)}, pedido $${total.toFixed(2)}`,
                        400
                    );
                }
            }
        }

        const venta = await crearVenta(
            client,
            cliente_id,
            usuario_id,
            total,
            fecha_entrega_programada,
            notas_entrega,
            pago
        );

        for (const linea of lineas) {
            await crearDetalleVenta(
                client,
                venta.id,
                linea.producto_id,
                linea.cantidad,
                linea.precio,
                linea.subtotal,
                linea.descripcion,
                linea.unidad_venta,
                linea.cantidad_inventario
            );

            if (linea.descontar) {
                const productoAntes = await buscarProductoPorIdConCliente(client, linea.producto_id);
                const cantidadAnterior = Number(productoAntes.cantidad);

                const inventario = await descontarInventario(
                    client,
                    linea.producto_id,
                    linea.cantidad_inventario
                );

                if (!inventario) {
                    throw new AppError(
                        `Inventario insuficiente para ${linea.nombre}`,
                        400
                    );
                }

                await registrarMovimiento(
                    client,
                    linea.producto_id,
                    'venta',
                    linea.cantidad_inventario,
                    cantidadAnterior,
                    Number(inventario.cantidad),
                    `Venta #${venta.id}`,
                    usuario_id
                );
            }
        }

        if (canastos_entregados && Number(canastos_entregados) > 0) {
            await registrarCanastos(
                client,
                cliente_id,
                'entrega',
                Number(canastos_entregados),
                venta.id,
                `Entrega con pedido #${venta.id}`,
                usuario_id,
                { modo: 'vacio', estado: 'confirmado' }
            );
        }

        if (pago === 'credito') {
            await registrarCredito(
                client,
                cliente_id,
                'cargo',
                total,
                venta.id,
                `Venta a crédito #${venta.id}`,
                usuario_id
            );
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
