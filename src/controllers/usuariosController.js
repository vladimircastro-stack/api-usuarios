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

        res.json(usuarios);

    } catch (error) {

        console.log(error);
        res.status(500).send('Error al obtener los usuarios');

    }
};



// Buscar usuario por ID
const buscarUsuario = async (req, res) => {
    try {

        const { id } = req.params;

        const usuario = await buscarUsuarioPorId(id);


        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }


        res.json(usuario);


    } catch (error) {

        console.log(error);
        res.status(500).send('Error al buscar usuario');

    }
};



// Crear usuario
const crearUsuarioController = async (req, res) => {
    try {

        const { nombre, correo, edad } = req.body;


        // Verificar si el correo ya existe
        const usuarioExistente = await buscarUsuarioPorCorreo(correo);


        if (usuarioExistente) {

            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });

        }


        const usuario = await crearUsuario(
            nombre,
            correo,
            edad
        );


        res.json(usuario);


    } catch (error) {

        console.log(error);
        res.status(500).send('Error al crear usuario');

    }
};



// Actualizar usuario
const actualizarUsuarioController = async (req, res) => {
    try {

        const { id } = req.params;
        const { nombre, correo, edad } = req.body;



        // Verificar si el correo pertenece a otro usuario
        const usuarioExistente = await buscarUsuarioPorCorreoYId(
            correo,
            id
        );


        if (usuarioExistente) {

            return res.status(400).json({
                mensaje: "El correo ya está registrado por otro usuario"
            });

        }



        const usuario = await actualizarUsuario(
            id,
            nombre,
            correo,
            edad
        );



        if (!usuario) {

            return res.status(404).send('Usuario no encontrado');

        }



        res.json(usuario);



    } catch (error) {

        console.log(error);
        res.status(500).send('Error al actualizar usuario');

    }
};



// Eliminar usuario
const eliminarUsuarioController = async (req, res) => {
    try {

        const { id } = req.params;


        const usuario = await eliminarUsuario(id);



        if (!usuario) {

            return res.status(404).send('Usuario no encontrado');

        }



        res.json({
            mensaje: 'Usuario eliminado correctamente',
            usuario
        });



    } catch (error) {

        console.log(error);
        res.status(500).send('Error al eliminar usuario');

    }
};



module.exports = {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario: crearUsuarioController,
    actualizarUsuario: actualizarUsuarioController,
    eliminarUsuario: eliminarUsuarioController
};