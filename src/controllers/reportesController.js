const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const {
    reporteVentas,
    reporteVentasPorCliente,
    reporteProductosMasVendidos,
    reporteEntregasPorEstado,
    dashboardResumen
} = require('../models/reportesModel');
const { getPrecioCanasto } = require('../models/configModel');
const { valorCanastos } = require('../utils/canastosHelper');

const dashboard = asyncHandler(async (req, res) => {
    const data = await dashboardResumen();
    const canastos = Number(data.canastos_pendientes || 0);
    sendSuccess(res, {
        mensaje: 'Resumen del dashboard',
        datos: {
            ...data,
            precio_canasto: getPrecioCanasto(),
            canastos_valor_pendiente: valorCanastos(canastos)
        }
    });
});

const ventas = asyncHandler(async (req, res) => {
    const { desde, hasta } = req.query;
    const data = await reporteVentas(desde, hasta);
    sendSuccess(res, { mensaje: 'Reporte de ventas', datos: data });
});

const ventasPorCliente = asyncHandler(async (req, res) => {
    const { desde, hasta } = req.query;
    const data = await reporteVentasPorCliente(desde, hasta);
    sendSuccess(res, { mensaje: 'Ventas por cliente', datos: data });
});

const productosMasVendidos = asyncHandler(async (req, res) => {
    const { desde, hasta, limite } = req.query;
    const data = await reporteProductosMasVendidos(desde, hasta, Number(limite) || 10);
    sendSuccess(res, { mensaje: 'Productos más vendidos', datos: data });
});

const entregasPorEstado = asyncHandler(async (req, res) => {
    const data = await reporteEntregasPorEstado();
    sendSuccess(res, { mensaje: 'Entregas por estado', datos: data });
});

module.exports = {
    dashboard,
    ventas,
    ventasPorCliente,
    productosMasVendidos,
    entregasPorEstado
};
