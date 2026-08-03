class AppError extends Error {
    constructor(mensaje, statusCode = 500) {
        super(mensaje);
        this.statusCode = statusCode;
        this.exito = false;
        this.isOperational = true;
    }
}

module.exports = AppError;
