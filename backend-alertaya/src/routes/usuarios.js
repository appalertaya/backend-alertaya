const express = require('express');
const router = express.Router();
const { actualizarTokenYUbicacion } = require('../controllers/usuarios.controller');
const verifyToken = require('../middlewares/verifyToken');

router.put('/token', verifyToken, actualizarTokenYUbicacion);

module.exports = router;
