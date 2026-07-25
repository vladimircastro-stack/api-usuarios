const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

app.get("/usuario", (req, res) => {
    const usuario = {
        id: 1,
        nombre: "Vladimir",
        profesion: "Desarrollador"
    };

    res.json(usuario);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});