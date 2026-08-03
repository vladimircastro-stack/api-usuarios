const propietarioOAdmin = (req, res, next) => {
    const esAdmin = req.usuario?.rol === 'admin';
    const esPropietario = Number(req.usuario?.id) === Number(req.params.id);

    if (!esAdmin && !esPropietario) {
        return res.status(403).json({
            exito: false,
            mensaje: 'No tienes permisos para modificar este usuario'
        });
    }

    next();
};

module.exports = propietarioOAdmin;
