const db = require('../config/db');

// Obtener reportes
const getReportes = (req, res) => {
  let { lat, lng, radio, categoria, ciudad } = req.query;
  console.log('Parámetros recibidos:', req.query);

  lat = parseFloat(lat);
  lng = parseFloat(lng);
  radio = parseFloat(radio);

  const query = 'SELECT * FROM reportes';

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión del pool:', err.message);
      return res.status(500).json({ error: 'Error de conexión a base de datos' });
    }

    connection.query(query, (err, results) => {
      connection.release();

      if (err) {
        console.error('Error al obtener reportes:', err);
        return res.status(500).json({ error: 'Error al obtener reportes' });
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

  if (!descripcion || !lat || !lng || !ciudad || !fechaHora || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO reportes (descripcion, lat, lng, ciudad, fechaHora, enviado, categoria, imagenUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;


  const valores = [
    descripcion,
    lat,
    lng,
    ciudad,
    fechaHora,
    enviado ?? true,
    categoria,
    imagenUrl ?? ''  // Valor por defecto si no viene desde el frontend
  ];

  db.query(sql, valores, (err, results) => {
    if (err) {
      console.error('Error al insertar reporte:', err);
      return res.status(500).json({ error: 'Error al insertar reporte' });
    }
    res.status(201).json({ mensaje: 'Reporte guardado', id: results.insertId });
  });
};



module.exports = {
  getReportes,
  crearReporte,
};
