const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const verificarRol = require('../middlewares/rol');
const validarId = require('../middlewares/validarId');
const validarProducto = require('../middlewares/validarProducto');

const {
    mostrarProductos,
    buscarProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productosController');

router.get('/', auth, mostrarProductos);
router.get('/:id', auth, validarId, buscarProducto);
router.post(
    '/',
    auth,
    verificarRol('admin'),
    validarProducto,
    crearProducto
);
router.put(
    '/:id',
    auth,
    validarId,
    verificarRol('admin'),
    validarProducto,
    actualizarProducto
);
router.delete(
    '/:id',
    auth,
    validarId,
    verificarRol('admin'),
    eliminarProducto
);

module.exports = router;
