const validarUsuario = (req, res, next) => {

    const { nombre, correo, edad } = req.body;


    // Verificar que los campos existan
    if (!nombre || !correo || !edad) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }


    // Verificar longitud del nombre
    if (nombre.length < 3) {
        return res.status(400).json({
            mensaje: "El nombre debe tener mínimo 3 caracteres"
        });
    }


    // Verificar formato del correo
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correo)) {
        return res.status(400).json({
            mensaje: "El correo no tiene un formato válido"
        });
    }


    // Verificar que la edad sea un número
    if (isNaN(edad)) {
        return res.status(400).json({
            mensaje: "La edad debe ser un número"
        });
    }


    // Verificar que la edad sea un número entero
    if (!Number.isInteger(Number(edad))) {
        return res.status(400).json({
            mensaje: "La edad debe ser un número entero"
        });
    }


    // Verificar rango de edad
    if (edad < 1 || edad > 120) {
        return res.status(400).json({
            mensaje: "La edad debe estar entre 1 y 120 años"
        });
    }


    next();
};


module.exports = validarUsuario;