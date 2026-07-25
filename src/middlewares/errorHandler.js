const errorHandler = (error, req, res, next) => {

    console.log(error);


    res.status(500).json({
        mensaje: "Ocurrió un error en el servidor",
        error: error.message
    });

};


module.exports = errorHandler;