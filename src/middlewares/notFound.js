const notFound = (req, res, next) => {

    res.status(404).json({
        mensaje: "Ruta no encontrada",
        ruta: req.originalUrl
    });

};


module.exports = notFound;