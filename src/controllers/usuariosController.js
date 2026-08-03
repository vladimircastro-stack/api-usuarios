const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { limpiarUsuario } = require('../utils/usuarioHelpers');
const {
    obtenerUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorCorreo,
    buscarUsuarioPorCorreoYId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario
} = require('../models/usuariosModel');

const mostrarUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await obtenerUsuarios();
    sendSuccess(res, {
        mensaje: 'Usuarios encontrados correctamente',
        datos: usuarios.map(limpiarUsuario)
    });
});

const buscarUsuario = asyncHandler(async (req, res) => {
    const usuario = await buscarUsuarioPorId(req.params.id);

    if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Usuario encontrado correctamente',
        datos: limpiarUsuario(usuario)
    });
});

const crearUsuarioController = asyncHandler(async (req, res) => {
    const { nombre, correo, edad, password } = req.body;
    const existe = await buscarUsuarioPorCorreo(correo);

    if (existe) {
        throw new AppError('El correo ya está registrado', 400);
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);
    const usuario = await crearUsuario(nombre, correo, edad, passwordEncriptada);

    sendSuccess(res, {
        mensaje: 'Usuario creado correctamente',
        datos: limpiarUsuario(usuario),
        statusCode: 201
    });
});

const actualizarUsuarioController = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, correo, edad, password } = req.body;

    const usuarioActual = await buscarUsuarioPorId(id);

    if (!usuarioActual) {
        throw new AppError('Usuario no encontrado', 404);
    }

    const correoDuplicado = await buscarUsuarioPorCorreoYId(correo, id);

    if (correoDuplicado) {
        throw new AppError('El correo ya está registrado por otro usuario', 400);
    }

    let passwordNueva;

    if (password) {
        passwordNueva = await bcrypt.hash(password, 10);
    }

    const usuario = await actualizarUsuario(
        id,
        nombre,
        correo,
        edad,
        passwordNueva
    );

    sendSuccess(res, {
        mensaje: 'Usuario actualizado correctamente',
        datos: limpiarUsuario(usuario)
    });
});

const eliminarUsuarioController = asyncHandler(async (req, res) => {
    const usuario = await eliminarUsuario(req.params.id);

    if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
    }

    sendSuccess(res, {
        mensaje: 'Usuario eliminado correctamente',
        datos: limpiarUsuario(usuario)
    });
});

const loginUsuarioController = asyncHandler(async (req, res) => {
    const { correo, password } = req.body;
    const usuario = await loginUsuario(correo);

    const correcto = usuario
        ? await bcrypt.compare(password, usuario.password)
        : false;

    if (!usuario || !correcto) {
        throw new AppError('Credenciales inválidas', 401);
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol
        },
        jwtConfig.secret,
        {
            expiresIn: jwtConfig.expires
        }
    );

    sendSuccess(res, {
        mensaje: 'Inicio de sesión correcto',
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            edad: usuario.edad,
            rol: usuario.rol
        }
    });
});

module.exports = {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario: crearUsuarioController,
    actualizarUsuario: actualizarUsuarioController,
    eliminarUsuario: eliminarUsuarioController,
    loginUsuario: loginUsuarioController
};
