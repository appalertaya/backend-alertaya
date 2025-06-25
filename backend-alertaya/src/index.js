const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Middleware de seguridad y formato JSON
app.use(cors({
  origin: '*', // o especifica el frontend: 'http://localhost:8100'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas principales
// reportes 
const reportesRouter = require('./routes/reportes');
app.use('/api/reportes', reportesRouter);

// auth 
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// valoraciones 
app.use('/api/valoraciones', require('./routes/valoraciones'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
});

//ping 
app.get('/ping', (req, res) => {
  res.send({ status: 'ok', message: 'API activa' });
});

