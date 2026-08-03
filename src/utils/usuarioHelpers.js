const limpiarUsuario = (usuario) => {
    if (!usuario) {
        return null;
    }

    const { password, ...datosUsuario } = usuario;
    return datosUsuario;
};

module.exports = {
    limpiarUsuario
};
