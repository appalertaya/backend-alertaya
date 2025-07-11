const express = require('express');
const router = express.Router();
const { getReportes, crearReporte, getMisReportes, eliminarReporte, getReportePorId, getCantidadPorCategoria } = require('../controllers/reportes.controller');
const db = require('../config/db');
const verifyToken = require('../middlewares/auth.middleware');

// GET, POST /api/reportes
router.get('/', getReportes);

// Aplica el middleware verifyToken y llama a crearReporte
const upload = require('../middlewares/multer'); // cloudinary
router.post('/', verifyToken, upload.array('imagenes', 5), crearReporte);

// para obtener reportes por usuario usando el token 
router.get('/mios', verifyToken, getMisReportes);
// Obtener cantidad de reportes por categoría
router.get('/categorias/cantidad', getCantidadPorCategoria);
// obtener un solo reporte 
router.get('/:id', getReportePorId);
// eliminar reportes del backend 
router.delete('/:id', verifyToken, eliminarReporte);


module.exports = router;
