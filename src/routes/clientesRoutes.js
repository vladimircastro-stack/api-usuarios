const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const verificarRol = require('../middlewares/rol');
const validarId = require('../middlewares/validarId');
const validarCliente = require('../middlewares/validarCliente');

const {
    mostrarClientes,
    buscarCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../controllers/clientesController');

router.get('/', auth, mostrarClientes);
router.get('/:id', auth, validarId, buscarCliente);
router.post('/', auth, validarCliente, crearCliente);
router.put(
    '/:id',
    auth,
    validarId,
    verificarRol('admin'),
    validarCliente,
    actualizarCliente
);
router.delete(
    '/:id',
    auth,
    validarId,
    verificarRol('admin'),
    eliminarCliente
);

module.exports = router;
