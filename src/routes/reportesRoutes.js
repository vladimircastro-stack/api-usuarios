const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const { verificarPermiso } = require('../middlewares/permisos');
const validarRangoFechas = require('../middlewares/validarRangoFechas');
const {
    dashboard,
    ventas,
    ventasPorCliente,
    productosMasVendidos,
    entregasPorEstado
} = require('../controllers/reportesController');

router.get('/dashboard', auth, dashboard);
router.get('/ventas', auth, verificarPermiso('reportes:read'), validarRangoFechas, ventas);
router.get('/ventas-por-cliente', auth, verificarPermiso('reportes:read'), validarRangoFechas, ventasPorCliente);
router.get('/productos-mas-vendidos', auth, verificarPermiso('reportes:read'), validarRangoFechas, productosMasVendidos);
router.get('/entregas-por-estado', auth, verificarPermiso('reportes:read'), entregasPorEstado);

module.exports = router;
