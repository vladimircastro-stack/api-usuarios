const errorHandler = (error, req, res, next) => {

    console.log(error);


    // Error de correo duplicado en PostgreSQL
    if (error.code === '23505') {

        return res.status(400).json({
            exito: false,
            mensaje: "El dato ya existe en la base de datos"
        });

    }


    // Error general del servidor
    res.status(500).json({
        exito: false,
        mensaje: "Ocurrió un error en el servidor"
    });

};


module.exports = errorHandler;