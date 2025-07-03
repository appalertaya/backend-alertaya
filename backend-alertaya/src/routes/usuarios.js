const express = require('express');
const router = express.Router();
const { actualizarTokenYUbicacion } = require('../controllers/usuarios.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.put('/token', verifyToken, actualizarTokenYUbicacion);

module.exports = router;
