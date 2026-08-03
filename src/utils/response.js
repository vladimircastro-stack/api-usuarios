const sendSuccess = (res, { mensaje, datos, token, usuario, statusCode = 200 }) => {
    const payload = {
        exito: true,
        mensaje
    };

    if (datos !== undefined) {
        payload.datos = datos;
    }

    if (token !== undefined) {
        payload.token = token;
    }

    if (usuario !== undefined) {
        payload.usuario = usuario;
    }

    return res.status(statusCode).json(payload);
};

const sendError = (res, { mensaje, statusCode = 500 }) => {
    return res.status(statusCode).json({
        exito: false,
        mensaje
    });
};

module.exports = {
    sendSuccess,
    sendError
};
