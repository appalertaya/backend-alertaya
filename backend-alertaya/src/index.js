const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8100',        // para desarrollo local (Ionic)
    'capacitor://localhost',        // para modo desarrollo en dispositivo
    'ionic://localhost',            // algunos entornos usan esto
    '*'                             // ⚠️ Aceptar desde todos los orígenes (solo si es necesario)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false  // como usas JWT por headers, esto debe ser false
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

