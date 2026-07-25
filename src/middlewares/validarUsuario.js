const validarUsuario = (req, res, next) => {

    console.log("PASÓ POR EL MIDDLEWARE");

    const { nombre, correo, edad } = req.body;

    // Verificar que los campos existan
    if (!nombre || !correo || !edad) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    // Verificar que la edad sea un número
    if (isNaN(edad)) {
        return res.status(400).json({
            mensaje: "La edad debe ser un número"
        });
    }

    // Verificar que la edad no sea negativa
    if (edad < 0) {
        return res.status(400).json({
            mensaje: "La edad no puede ser negativa"
        });
    }

    next();
};

module.exports = validarUsuario;