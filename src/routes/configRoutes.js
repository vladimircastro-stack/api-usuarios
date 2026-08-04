const express = require('express');

const router = express.Router();

const auth = require('../middlewares/auth');
const verificarRol = require('../middlewares/rol');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { obtener, actualizar } = require('../controllers/configController');
const { getAllConfig } = require('../models/configModel');

router.get('/public', auth, asyncHandler(async (req, res) => {
    const datos = await getAllConfig();
    sendSuccess(res, {
        mensaje: 'Configuración pública',
        datos: {
            precio_canasto: datos.precio_canasto,
            nombre_empresa: datos.nombre_empresa
        }
    });
}));

router.get('/', auth, verificarRol('admin'), obtener);
router.patch('/', auth, verificarRol('admin'), actualizar);

module.exports = router;
