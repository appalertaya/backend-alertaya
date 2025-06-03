const express = require('express');
const router = express.Router();
const { register, verifyEmail, login } = require('../controllers/auth.controller');

// Registro
router.post('/register', register);
// Email
router.get('/verify-email', verifyEmail);
// Login
router.post('/login', login);

module.exports = router;
