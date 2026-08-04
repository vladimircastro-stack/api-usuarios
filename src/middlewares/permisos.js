const AppError = require('../utils/AppError');

const PERMISOS = {
    admin: ['*'],
    vendedor: ['clientes:read', 'clientes:write', 'productos:read', 'ventas:read', 'ventas:write', 'entregas:read', 'reportes:read', 'canastos:read', 'canastos:write', 'credito:read', 'credito:write'],
    almacen: ['productos:read', 'inventario:read', 'inventario:write', 'ventas:read', 'entregas:read', 'canastos:read', 'credito:read'],
    repartidor: ['clientes:read', 'ventas:read', 'entregas:read', 'entregas:write', 'canastos:read', 'canastos:write', 'credito:read'],
    usuario: ['clientes:read', 'clientes:write', 'productos:read', 'ventas:read', 'ventas:write', 'entregas:read', 'reportes:read', 'canastos:read', 'canastos:write', 'credito:read', 'credito:write']
};

const verificarPermiso = (...permisosRequeridos) => (req, res, next) => {
    if (!req.usuario) {
        return next(new AppError('Usuario no autenticado', 401));
    }

    const rol = req.usuario.rol;
    const permisosRol = PERMISOS[rol] || [];

    if (permisosRol.includes('*')) {
        return next();
    }

    const autorizado = permisosRequeridos.some((permiso) => permisosRol.includes(permiso));

    if (!autorizado) {
        return next(new AppError('No tienes permisos para realizar esta acción', 403));
    }

    return next();
};

module.exports = { verificarPermiso, PERMISOS };
