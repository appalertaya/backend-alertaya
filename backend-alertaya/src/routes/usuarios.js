const express = require('express');
const router = express.Router();
const { actualizarTokenYUbicacion } = require('../controllers/usuarios.controller');
const verifyToken = require('../middlewares/auth.middleware');
const {
    getPerfilUsuario,
    actualizarPerfilUsuario
} = require('../controllers/usuarios.controller');

router.put('/token', verifyToken, actualizarTokenYUbicacion);
router.get('/perfil', verifyToken, getPerfilUsuario);
router.put('/perfil', verifyToken, actualizarPerfilUsuario);

module.exports = router;
