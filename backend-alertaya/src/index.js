const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8100',        // Ionic local
    'http://localhost:4200',        // Angular local (si aplica)
    'capacitor://localhost',        // App móvil
    'ionic://localhost',            // Otras builds móviles
    'https://backend-alertaya.onrender.com' // para solicitudes internas o futuras
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.options('*', cors()); // habilita preflight para todas las rutas

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

