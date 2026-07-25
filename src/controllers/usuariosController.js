const pool = require('../db');


// Mostrar todos los usuarios
const mostrarUsuarios = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM usuarios');
        res.json(resultado.rows);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener los usuarios');
    }
};


// Buscar usuario por ID
const buscarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al buscar usuario');
    }
};


// Crear usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, edad } = req.body;

        const resultado = await pool.query(
            'INSERT INTO usuarios (nombre, correo, edad) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, edad]
        );

        res.json(resultado.rows[0]);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al crear usuario');
    }
};


// Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, edad } = req.body;

        const resultado = await pool.query(
            'UPDATE usuarios SET nombre=$1, correo=$2, edad=$3 WHERE id=$4 RETURNING *',
            [nombre, correo, edad, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al actualizar usuario');
    }
};


// Eliminar usuario
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente',
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al eliminar usuario');
    }
};


module.exports = {
    mostrarUsuarios,
    buscarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};