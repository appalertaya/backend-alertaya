const express = require('express');
const router = express.Router();
const { getReportes, crearReporte } = require('../controllers/reportes.controller');
const db = require('../config/db');
const verifyToken = require('../middlewares/auth.middleware');

// GET, POST /api/reportes
router.get('/', getReportes);
// Aplica el middleware verifyToken y llama a crearReporte
router.post('/', verifyToken, crearReporte);

module.exports = router;
