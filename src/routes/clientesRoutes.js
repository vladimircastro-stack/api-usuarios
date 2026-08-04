const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const validarId = require('../middlewares/validarId');
const validarCliente = require('../middlewares/validarCliente');
const { verificarPermiso } = require('../middlewares/permisos');
const verificarRol = require('../middlewares/rol');

const {
    mostrarClientes,
    buscarCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../controllers/clientesController');

router.get('/', auth, verificarPermiso('clientes:read'), mostrarClientes);
router.get('/:id', auth, validarId, verificarPermiso('clientes:read'), buscarCliente);
router.post('/', auth, verificarPermiso('clientes:write'), validarCliente, crearCliente);
router.put(
    '/:id',
    auth,
    validarId,
    verificarPermiso('clientes:write'),
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
