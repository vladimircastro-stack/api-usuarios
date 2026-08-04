const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const { verificarPermiso } = require('../middlewares/permisos');
const {
    resumen,
    saldo,
    movimientos,
    pendientes,
    entrega,
    mercancia,
    confirmar,
    devolucion
} = require('../controllers/canastosController');

router.get('/resumen', auth, verificarPermiso('canastos:read'), resumen);
router.get('/movimientos', auth, verificarPermiso('canastos:read'), movimientos);
router.get('/pendientes', auth, verificarPermiso('canastos:read'), pendientes);
router.get('/cliente/:id', auth, validarId, verificarPermiso('canastos:read'), saldo);
router.post('/entrega', auth, verificarPermiso('canastos:write'), entrega);
router.post('/mercancia', auth, verificarPermiso('canastos:write'), mercancia);
router.patch('/:id/confirmar', auth, validarId, verificarPermiso('canastos:write'), confirmar);
router.post('/devolucion', auth, verificarPermiso('canastos:write'), devolucion);

module.exports = router;
