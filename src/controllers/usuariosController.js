const bcrypt = require('bcrypt');

const {
    obtenerUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorCorreo,
    buscarUsuarioPorCorreoYId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../models/usuariosModel');


// Mostrar todos los usuarios
const mostrarUsuarios = async (req, res) => {

    try {

        const usuarios = await obtenerUsuarios();

        res.json({
            exito: true,
            mensaje: "Usuarios encontrados correctamente",
            datos: usuarios
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            exito: false,
            mensaje: "Error al obtener usuarios"
        });

    }

};


// Buscar usuario por ID
const buscarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const usuario = await buscarUsuarioPorId(id);


        if (!usuario) {

            return res.status(404).json({
                exito: false,
                mensaje: "Usuario no encontrado"
            });

        }


        res.json({
            exito: true,
            mensaje: "Usuario encontrado correctamente",
            datos: usuario
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            exito: false,
            mensaje: "Error al buscar usuario"
        });

    }

};



// Crear usuario
const crearUsuarioController = async (req, res) => {

    try {

        const { nombre, correo, edad, password } = req.body;


        // Verificar correo existente
        const usuarioExistente = await buscarUsuarioPorCorreo(correo);


        if (usuarioExistente) {

            return res.status(400).json({
                exito: false,
                mensaje: "El correo ya está registrado"
            });

        }


        // Encriptar contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);



        const usuario = await crearUsuario(
            nombre,
            correo,
            edad,
            passwordEncriptada
        );


        res.status(201).json({

            exito: true,
            mensaje: "Usuario creado correctamente",
            datos: usuario

        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            exito: false,
            mensaje: "Error al crear usuario"
        });

    }

};



// Actualizar usuario
const actualizarUsuarioController = async (req, res) => {

    try {

        const { id } = req.params;

        const { nombre, correo, edad, password } = req.body;



        // Verificar correo duplicado
        const usuarioExistente = await buscarUsuarioPorCorreoYId(
            correo,
            id
        );


        if (usuarioExistente) {

            return res.status(400).json({
                exito: false,
                mensaje: "El correo ya está registrado por otro usuario"
            });

        }



        // Encriptar nueva contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);



        const usuario = await actualizarUsuario(
            id,
            nombre,
            correo,
            edad,
            passwordEncriptada
        );



        if (!usuario) {

            return res.status(404).json({
                exito: false,
                mensaje: "Usuario no encontrado"
            });

        }



        res.json({

            exito: true,
            mensaje: "Usuario actualizado correctamente",
            datos: usuario

        });



    } catch (error) {

        console.log(error);


        res.status(500).json({
            exito: false,
            mensaje: "Error al actualizar usuario"
        });

    }

};



// Eliminar usuario
const eliminarUsuarioController = async (req, res) => {

    try {

        const { id } = req.params;


        const usuario = await eliminarUsuario(id);


        if (!usuario) {

            return res.status(404).json({
                exito: false,
                mensaje: "Usuario no encontrado"
            });

        }


        res.json({

            exito: true,
            mensaje: "Usuario eliminado correctamente",
            datos: usuario

        });



    } catch (error) {

        console.log(error);


        res.status(500).json({
            exito: false,
            mensaje: "Error al eliminar usuario"
        });

    }

};



module.exports = {

    mostrarUsuarios,
    buscarUsuario,

    crearUsuario: crearUsuarioController,

    actualizarUsuario: actualizarUsuarioController,

    eliminarUsuario: eliminarUsuarioController

};