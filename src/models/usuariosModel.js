const pool = require('../db');


// Obtener todos los usuarios
const obtenerUsuarios = async () => {

    try {

        const resultado = await pool.query(
            'SELECT * FROM usuarios'
        );

        return resultado.rows;

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Buscar usuario por ID
const buscarUsuarioPorId = async (id) => {

    try {

        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [id]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Buscar usuario por correo
const buscarUsuarioPorCorreo = async (correo) => {

    try {

        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Buscar correo excluyendo usuario actual
const buscarUsuarioPorCorreoYId = async (correo, id) => {

    try {

        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1 AND id != $2',
            [correo, id]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Crear usuario
const crearUsuario = async (nombre, correo, edad, password) => {

    try {

        const resultado = await pool.query(
            'INSERT INTO usuarios (nombre, correo, edad, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correo, edad, password]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Actualizar usuario
const actualizarUsuario = async (id, nombre, correo, edad, password) => {

    try {

        const resultado = await pool.query(
            'UPDATE usuarios SET nombre=$1, correo=$2, edad=$3, password=$4 WHERE id=$5 RETURNING *',
            [nombre, correo, edad, password, id]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Eliminar usuario
const eliminarUsuario = async (id) => {

    try {

        const resultado = await pool.query(
            'DELETE FROM usuarios WHERE id=$1 RETURNING *',
            [id]
        );

        return resultado.rows[0];

    } catch (error) {

        console.log(error);
        throw error;

    }

};



// Exportar funciones
module.exports = {

    obtenerUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorCorreo,
    buscarUsuarioPorCorreoYId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario

};