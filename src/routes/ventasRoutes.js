const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const validarVenta = require('../middlewares/validarVenta');
const { verificarPermiso } = require('../middlewares/permisos');

const {
    mostrarVentas,
    buscarVenta,
    crearVenta
} = require('../controllers/ventasController');

router.get('/', auth, verificarPermiso('ventas:read'), mostrarVentas);
router.get('/:id', auth, validarId, verificarPermiso('ventas:read'), buscarVenta);
router.post('/', auth, verificarPermiso('ventas:write'), validarVenta, crearVenta);

module.exports = router;
