const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const { verificarPermiso } = require('../middlewares/permisos');
const { listarEntregas, actualizarEntrega } = require('../controllers/entregasController');

router.get('/', auth, verificarPermiso('entregas:read'), listarEntregas);
router.patch('/:id', auth, validarId, verificarPermiso('entregas:write'), actualizarEntrega);

module.exports = router;
