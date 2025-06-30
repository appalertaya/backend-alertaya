
const db = require('../config/db');

const jwt = require('jsonwebtoken'); // para token, historial de reportes por usuario 

// Obtener reportes
const getReportes = (req, res) => {
  let { lat, lng, radio, categoria, ciudad } = req.query;
  console.log('Parámetros recibidos:', req.query);

  // Conversión segura
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  radio = parseFloat(radio);

  const query = 'SELECT * FROM reportes';


  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión del pool:', err.message);
      return res.status(500).json({ error: 'Error de conexión a base de datos', detalle: err.message });
    }

    connection.query(query, (err, results) => {
      connection.release();

      if (err) {
        console.error('Error al obtener reportes:', err);
        return res.status(500).json({ error: 'Error al obtener reportes', detalle: err.message });
      }

      console.log(`Total reportes en BD: ${results.length}`);
      let reportes = results;

      // Filtro por ubicación
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radio)) {
        const radioGrados = radio / 111;
        console.log(`📍 Filtro por ubicación: lat=${lat}, lng=${lng}, radioKm=${radio}, radioGrados=${radioGrados.toFixed(4)}`);

        reportes = reportes.filter((r) => {
          const dist = Math.sqrt(
            Math.pow(parseFloat(r.lat) - lat, 2) +
            Math.pow(parseFloat(r.lng) - lng, 2)
          );
          return dist <= radioGrados;
        });

        console.log(`➡️ Después del filtro por ubicación: ${reportes.length}`);
      }

      // Filtro por categoría
      if (categoria) {
        const cat = decodeURIComponent(categoria).trim().toLowerCase();
        reportes = reportes.filter((r) =>
          r.categoria && r.categoria.trim().toLowerCase() === cat
        );
        console.log(`Después del filtro por categoría (${cat}): ${reportes.length}`);
      }

      // Filtro por ciudad
      if (ciudad) {
        const city = decodeURIComponent(ciudad).trim().toLowerCase();
        reportes = reportes.filter((r) =>
          r.ciudad && r.ciudad.trim().toLowerCase() === city
        );
        console.log(`Después del filtro por ciudad (${city}): ${reportes.length}`);
      }

      console.log('Después del filtrado, total reportes:', reportes.length);
      return res.json(reportes);
    });
  });
};

const crearReporte = (req, res) => {
  const { descripcion, lat, lng, ciudad, fechaHora, enviado, categoria, imagenUrl } = req.body;
  console.log('Datos recibidos en POST:', req.body);

  const usuarioId = req.user?.id;

  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!descripcion || !lat || !lng || !ciudad || !fechaHora || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO reportes (descripcion, lat, lng, ciudad, fechaHora, enviado, categoria, imagenUrl, usuarioId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    descripcion,
    lat,
    lng,
    ciudad,
    fechaHora,
    enviado ?? true,
    categoria,
    imagenUrl ?? '',
    usuarioId
  ];

  db.query(sql, valores, (err, results) => {
    if (err) {
      console.error('Error al insertar reporte:', err);
      return res.status(500).json({ error: 'Error al insertar reporte' });
    }
    res.status(201).json({ mensaje: 'Reporte guardado', id: results.insertId });
  });
};

const getMisReportes = (req, res) => {
  console.log(req.user)
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  let usuarioId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    usuarioId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const sql = 'SELECT * FROM reportes WHERE usuarioId = ? ORDER BY fechaHora DESC';

  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error('Error al obtener reportes del usuario:', err);
      return res.status(500).json({ error: 'Error al obtener tus reportes' });
    }

    res.json(results);
  });
};

const getReportePorId = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM reportes WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener reporte por ID:', err);
      return res.status(500).json({ error: 'Error al obtener el reporte' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(results[0]);
  });
};


const eliminarReporte = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM reportes WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar reporte:', err);
      return res.status(500).json({ error: 'Error al eliminar reporte' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.status(200).json({ mensaje: 'Reporte eliminado correctamente' });
  });
};

const getCantidadPorCategoria = (req, res) => {
  const sql = `
    SELECT categoria, COUNT(*) as cantidad
    FROM reportes
    GROUP BY categoria
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al obtener conteo por categoría:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(rows);
  });
};

module.exports = {
  getReportes,
  crearReporte,
  getMisReportes,
  getReportePorId,
  eliminarReporte,
  getCantidadPorCategoria
};



