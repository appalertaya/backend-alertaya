const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ⚠️ Usa cors() sin argumentos primero
app.use(cors());

// ⚠️ Luego configura manualmente los headers para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // o pon aquí tu frontend real si ya está definido
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ⚠️ Manejar manualmente preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*'); // o tu dominio si lo restringes
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

app.use(express.json());

// Rutas
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/valoraciones', require('./routes/valoraciones'));

// Ping de prueba
app.get('/ping', (req, res) => {
  res.send({ status: 'ok', message: 'API activa' });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
});
