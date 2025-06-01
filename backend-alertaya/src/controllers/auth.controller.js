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
      const enlace = `https://https://backend-alertaya-production.up.railway.app/api/auth/verify-email?token=${token}`;

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

module.exports = { register };
