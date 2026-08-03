const verificarRol = (...rolesPermitidos) => {


    return (req, res, next) => {


        if (!req.usuario) {

            return res.status(401).json({

                exito: false,

                mensaje: "Usuario no autenticado"

            });

        }




        if (!rolesPermitidos.includes(req.usuario.rol)) {

            return res.status(403).json({

                exito: false,

                mensaje: "No tienes permisos para realizar esta acción"

            });

        }




        next();


    };


};



module.exports = verificarRol;