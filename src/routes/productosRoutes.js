const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const validarProducto = require('../middlewares/validarProducto');
const { verificarPermiso } = require('../middlewares/permisos');
const verificarRol = require('../middlewares/rol');

const {
    mostrarProductos,
    buscarProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productosController');

router.get('/', auth, verificarPermiso('productos:read'), mostrarProductos);
router.get('/:id', auth, validarId, verificarPermiso('productos:read'), buscarProducto);
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
