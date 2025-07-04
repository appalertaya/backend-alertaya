const express = require('express');
const router = express.Router();
const { valorarReporte, obtenerResumenValoraciones, obtenerValoracionUsuario, eliminarValoracion } = require('../controllers/valoraciones.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/:id', verifyToken, valorarReporte);
router.get('/usuario/:reporteId', verifyToken, obtenerValoracionUsuario);
router.get('/:id', obtenerResumenValoraciones);
router.delete('/:id', verifyToken, eliminarValoracion);

module.exports = router;

