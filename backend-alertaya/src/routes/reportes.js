const express = require('express');
const router = express.Router();
const { getReportes, crearReporte } = require('../controllers/reportes.controller');
const connection = require('../config/db');

// GET, POST /api/reportes
router.get('/', getReportes);
router.post('/', crearReporte);

module.exports = router;
