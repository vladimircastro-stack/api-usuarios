const express = require('express');

const app = express();

app.use(express.json());

const PORT = 3000;


// Importar rutas de usuarios
const usuariosRoutes = require('./routes/usuarios');


// Usar rutas
app.use('/', usuariosRoutes);


// Ruta principal
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});


// Encender servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});