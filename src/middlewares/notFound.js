const notFound = (req, res, next) => {


    res.status(404).json({

        exito: false,

        mensaje: "La ruta solicitada no existe",

        ruta: req.originalUrl,

        metodo: req.method

    });


};


module.exports = notFound;