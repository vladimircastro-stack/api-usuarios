const express = require('express');

const router = express.Router();


const validarUsuario = require('../middlewares/validarUsuario');


const {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario
} = require('../controllers/usuariosController');



// Mostrar todos los usuarios
router.get('/usuarios', mostrarUsuarios);



// Buscar usuario por ID
router.get('/usuarios/:id', buscarUsuario);



// Crear usuario
router.post('/usuarios', validarUsuario, crearUsuario);



// Actualizar usuario
router.put('/usuarios/:id', actualizarUsuario);



// Eliminar usuario
router.delete('/usuarios/:id', eliminarUsuario);



// Login
router.post('/login', loginUsuario);



module.exports = router;