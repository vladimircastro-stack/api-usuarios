const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const validarVenta = require('../middlewares/validarVenta');

const {
    mostrarVentas,
    buscarVenta,
    crearVenta
} = require('../controllers/ventasController');

router.get('/', auth, mostrarVentas);
router.get('/:id', auth, validarId, buscarVenta);
router.post('/', auth, validarVenta, crearVenta);

module.exports = router;
