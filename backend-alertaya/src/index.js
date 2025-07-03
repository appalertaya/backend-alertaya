const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*', // En producción puedes cambiar esto por la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Rutas
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/valoraciones', require('./routes/valoraciones'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Ping
app.get('/ping', (req, res) => {
  res.send({ status: 'ok', message: 'API activa' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
