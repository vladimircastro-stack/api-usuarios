const express = require('express');

const router = express.Router();

const validarUsuario = require('../middlewares/validarUsuario');
const validarLogin = require('../middlewares/validarLogin');
const validarActualizarUsuario = require('../middlewares/validarActualizarUsuario');
const validarId = require('../middlewares/validarId');
const auth = require('../middlewares/auth');
const verificarRol = require('../middlewares/rol');
const propietarioOAdmin = require('../middlewares/propietarioOAdmin');
const { sendSuccess } = require('../utils/response');

const permitirRegistro = require('../middlewares/permitirRegistro');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { buscarUsuarioPorId } = require('../models/usuariosModel');
const {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario
} = require('../controllers/usuariosController');

/**
 * @openapi
 * /usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nombre: Juan Pérez
 *             correo: juan@example.com
 *             edad: 25
 *             password: secreto123
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/usuarios', permitirRegistro, validarUsuario, crearUsuario);

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Usuarios]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             correo: juan@example.com
 *             password: secreto123
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', validarLogin, loginUsuario);

router.get('/usuarios', auth, verificarRol('admin'), mostrarUsuarios);
router.get('/usuarios/:id', auth, validarId, propietarioOAdmin, buscarUsuario);
router.put(
    '/usuarios/:id',
    auth,
    validarId,
    propietarioOAdmin,
    validarActualizarUsuario,
    actualizarUsuario
);
router.delete(
    '/usuarios/:id',
    auth,
    validarId,
    verificarRol('admin'),
    eliminarUsuario
);

router.get('/perfil', auth, asyncHandler(async (req, res) => {
    const usuario = await buscarUsuarioPorId(req.usuario.id);
    if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
    }
    sendSuccess(res, {
        mensaje: 'Acceso permitido',
        usuario
    });
}));

router.get('/admin', auth, verificarRol('admin'), (req, res) => {
    sendSuccess(res, {
        mensaje: 'Bienvenido administrador',
        usuario: req.usuario
    });
});

module.exports = router;
