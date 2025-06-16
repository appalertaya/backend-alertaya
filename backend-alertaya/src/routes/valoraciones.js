const express = require('express');
const router = express.Router();
const { valorarReporte, obtenerResumenValoraciones, obtenerValoracionUsuario } = require('../controllers/valoraciones.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/:id', verifyToken, valorarReporte);
router.get('/usuario/:reporteId', verifyToken, obtenerValoracionUsuario);
router.get('/:id', obtenerResumenValoraciones);

module.exports = router;
