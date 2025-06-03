const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configura el transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
    }
});

// para generacion de token en el login 
const jwt = require('jsonwebtoken');

// Registrar
const register = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Verifica si ya existe un usuario con ese email
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al consultar usuarios.' });
        if (resultados.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');

        // Insertar nuevo usuario
        const sql = `INSERT INTO usuarios (nombre, email, password, tokenVerificacion) VALUES (?, ?, ?, ?)`;
        const valores = [nombre, email, hashedPassword, token];

        db.query(sql, valores, (err2, result) => {
            if (err2) return res.status(500).json({ error: 'Error al registrar usuario.' });

            // Enviar correo de verificación
            const enlace = `${process.env.APP_BASE_URL}/api/auth/verify-email?token=${token}`;

            transporter.sendMail({
                from: '"Alertaya" <tucorreo@gmail.com>',
                to: email,
                subject: 'Verifica tu cuenta en Alertaya',
                html: `<p>Hola ${nombre},</p>
               <p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
               <a href="${enlace}">${enlace}</a>`
            }, (error, info) => {
                if (error) {
                    console.error('Error al enviar correo:', error);
                } else {
                    console.log('Correo enviado:', info.response);
                }
            });

            res.status(201).json({ mensaje: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.' });
        });
    });
};

// Email
const verifyEmail = (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado.' });
    }

    const sql = 'UPDATE usuarios SET verificado = TRUE, tokenVerificacion = NULL WHERE tokenVerificacion = ?';

    db.query(sql, [token], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al verificar correo.' });

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado.' });
        }

        res.status(200).send(`<h2>Correo verificado con éxito. </h2><p>Ya puedes iniciar sesión en la app.</p>`);
    });
};

// Login
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al buscar el usuario.' });

        if (resultados.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña inválidos.' });
        }

        const usuario = resultados[0];

        // Verificar contraseña
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(401).json({ error: 'Correo o contraseña inválidos.' });
        }

        // Verificar si está activado
        if (!usuario.verificado) {
            return res.status(403).json({ error: 'Tu cuenta aún no está verificada, revisa tu correo.' });
        }

        // Login exitoso
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    });
};


module.exports = { register, verifyEmail, login };
