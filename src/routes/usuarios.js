const express = require('express');
const router = express.Router();

const validarUsuario = require('../middlewares/validarUsuario');

const {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuariosController');


// Mostrar todos los usuarios
router.get('/usuarios', mostrarUsuarios);


// Buscar usuario por ID
router.get('/usuarios/:id', buscarUsuario);


// Crear usuario con validación
router.post('/usuarios', validarUsuario, crearUsuario);


// Actualizar usuario
router.put('/usuarios/:id', actualizarUsuario);


// Eliminar usuario
router.delete('/usuarios/:id', eliminarUsuario);


module.exports = router;