const express = require('express');
const router = express.Router();
const { valorarReporte, obtenerResumenValoraciones } = require('../controllers/valoraciones.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/', verifyToken, valorarReporte);
router.get('/:id', obtenerResumenValoraciones);

module.exports = router;
