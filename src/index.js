const express = require('express');

const app = express();

app.use(express.json());

const PORT = 3000;


// Importar rutas de usuarios
const usuariosRoutes = require('./routes/usuarios');


// Importar middlewares
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');


// Usar rutas
app.use('/', usuariosRoutes);


// Ruta principal
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});


// Manejar rutas que no existen (404)
app.use(notFound);


// Manejo global de errores (500)
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});