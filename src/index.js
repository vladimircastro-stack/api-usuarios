const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Mostrar todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM usuarios');
        res.json(resultado.rows);

    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener los usuarios');
    }
});

// Buscar usuario por ID
app.get('/usuarios/:id', async (req, res) => {
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
});

// Crear usuario
app.post('/usuarios', async (req, res) => {
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
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});