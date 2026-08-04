const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const { verificarPermiso } = require('../middlewares/permisos');
const { resumen, saldo, abono } = require('../controllers/creditoController');

router.get('/resumen', auth, verificarPermiso('credito:read'), resumen);
router.get('/cliente/:id', auth, validarId, verificarPermiso('credito:read'), saldo);
router.post('/abono', auth, verificarPermiso('credito:write'), abono);

module.exports = router;
