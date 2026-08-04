const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const { verificarPermiso } = require('../middlewares/permisos');
const {
    listarMovimientos,
    listarBajoStock,
    ajustar,
    resumen
} = require('../controllers/inventarioController');

router.get('/resumen', auth, verificarPermiso('inventario:read'), resumen);
router.get('/movimientos', auth, verificarPermiso('inventario:read'), listarMovimientos);
router.get('/bajo-stock', auth, verificarPermiso('inventario:read', 'productos:read'), listarBajoStock);
router.put('/:id/ajustar', auth, validarId, verificarPermiso('inventario:write'), ajustar);

module.exports = router;
