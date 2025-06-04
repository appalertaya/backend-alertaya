const express = require('express');
const router = express.Router();
const { getReportes, crearReporte, getMisReportes } = require('../controllers/reportes.controller');
const db = require('../config/db');
const verifyToken = require('../middlewares/auth.middleware');

// GET, POST /api/reportes
router.get('/', getReportes);
// Aplica el middleware verifyToken y llama a crearReporte
router.post('/', verifyToken, crearReporte);
// para obtener reportes por usuario usando el token 
router.get('/mios', verifyToken, getMisReportes);

module.exports = router;
