const pool = require('../db');

const CAMPOS_PUBLICOS = 'id, nombre, correo, edad, rol';

const obtenerUsuarios = async () => {
    const resultado = await pool.query(
        `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY id`
    );
    return resultado.rows;
};

const buscarUsuarioPorId = async (id) => {
    const resultado = await pool.query(
        `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
        [id]
    );
    return resultado.rows[0];
};

const buscarUsuarioPorCorreo = async (correo) => {
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1',
        [correo]
    );
    return resultado.rows[0];
};

const buscarUsuarioPorCorreoYId = async (correo, id) => {
    const resultado = await pool.query(
        'SELECT id FROM usuarios WHERE correo = $1 AND id != $2',
        [correo, id]
    );
    return resultado.rows[0];
};

const ROLES_VALIDOS = ['admin', 'vendedor', 'almacen', 'repartidor', 'usuario'];

const crearUsuario = async (nombre, correo, edad, password, rol = 'usuario') => {
    const rolFinal = ROLES_VALIDOS.includes(rol) ? rol : 'usuario';
    const resultado = await pool.query(
        `INSERT INTO usuarios (nombre, correo, edad, password, rol)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${CAMPOS_PUBLICOS}`,
        [nombre, correo, edad, password, rolFinal]
    );
    return resultado.rows[0];
};

const actualizarUsuario = async (id, nombre, correo, edad, password, rol) => {
    const params = [nombre, correo, edad];
    let sql = `UPDATE usuarios SET nombre = $1, correo = $2, edad = $3`;

    if (password) {
        params.push(password);
        sql += `, password = $${params.length}`;
    }

    if (rol && ROLES_VALIDOS.includes(rol)) {
        params.push(rol);
        sql += `, rol = $${params.length}`;
    }

    params.push(id);
    sql += ` WHERE id = $${params.length} RETURNING ${CAMPOS_PUBLICOS}`;

    const resultado = await pool.query(sql, params);
    return resultado.rows[0];
};

const eliminarUsuario = async (id) => {
    const resultado = await pool.query(
        `DELETE FROM usuarios WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`,
        [id]
    );
    return resultado.rows[0];
};

const loginUsuario = async (correo) => {
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1',
        [correo]
    );
    return resultado.rows[0];
};

const contarUsuarios = async () => {
    const resultado = await pool.query('SELECT COUNT(*)::int AS total FROM usuarios');
    return resultado.rows[0].total;
};

const buscarUsuarioConPasswordPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT id, password FROM usuarios WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorCorreo,
    buscarUsuarioPorCorreoYId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    loginUsuario,
    buscarUsuarioConPasswordPorId,
    contarUsuarios,
    ROLES_VALIDOS
};
