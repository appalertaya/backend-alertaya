const enviarNotificacionesUsuariosCercanos = require('../utils/sendNotification');

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

const streamifier = require('streamifier');
const admin = require('../config/firebase');
const haversine = require('haversine-distance');

const crearReporte = async (req, res) => {
  const { descripcion, lat, lng, ciudad, fechaHora, enviado, categoria } = req.body;
  const usuarioId = req.user?.id;

  if (!usuarioId) return res.status(401).json({ error: 'Usuario no autenticado' });

  if (!descripcion || !lat || !lng || !ciudad || !fechaHora || !categoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: 'Debe subir al menos 2 imágenes' });
  }

  try {
    // Insertar reporte
    const sqlReporte = `
      INSERT INTO reportes (descripcion, lat, lng, ciudad, fechaHora, enviado, categoria, usuarioId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valores = [
      descripcion,
      lat,
      lng,
      ciudad,
      fechaHora,
      enviado !== undefined ? (enviado ? 1 : 0) : 1,
      categoria,
      usuarioId
    ];
    const [resultado] = await db.promise().query(sqlReporte, valores);
    const idReporte = resultado.insertId;

    // Subir imágenes a Cloudinary y registrar en la BD
    for (const file of req.files) {
      const resultadoCloudinary = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'alertaya/reportes' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      const sqlImagen = `
        INSERT INTO ImagenesReporte (id_reporte, url_imagen, public_id)
        VALUES (?, ?, ?)
      `;
      await db.promise().query(sqlImagen, [
        idReporte,
        resultadoCloudinary.secure_url,
        resultadoCloudinary.public_id
      ]);
    }

    // Enviar notificaciones a usuarios cercanos
    try {
      const [usuarios] = await db.promise().query(`
        SELECT tokenFCM, ultimaLat, ultimaLng FROM usuarios
        WHERE tokenFCM IS NOT NULL AND ultimaLat IS NOT NULL AND ultimaLng IS NOT NULL
      `);

      await enviarNotificacionesUsuariosCercanos(
        { lat, lng, ciudad, categoria },
        usuarios
      );
    } catch (errorNoti) {
      console.warn('Error durante envío de notificaciones:', errorNoti.message || errorNoti);
    }

    res.status(201).json({ mensaje: 'Reporte creado con imágenes', id: idReporte });
  } catch (err) {
    console.error('Error al crear reporte:', err);
    res.status(500).json({ error: 'Error al crear el reporte', detalle: err.message || err });
  }
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

const getReportePorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener reporte
    const [reportes] = await db.promise().query('SELECT * FROM reportes WHERE id = ?', [id]);
    if (reportes.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const reporte = reportes[0];

    // Obtener imágenes asociadas
    const [imagenes] = await db.promise().query(
      'SELECT url_imagen FROM ImagenesReporte WHERE id_reporte = ?',
      [id]
    );
    reporte.imagenes = imagenes.map((img) => img.url_imagen);

    // Obtener conteo de valoraciones
    const [valoraciones] = await db.promise().query(
      `SELECT
        SUM(CASE WHEN utilidad = 'util' THEN 1 ELSE 0 END) AS utiles,
        SUM(CASE WHEN utilidad = 'no_util' THEN 1 ELSE 0 END) AS no_utiles
      FROM valoraciones
      WHERE reporte_id = ?`,
      [id]
    );

    reporte.valoraciones_utiles = valoraciones[0].utiles || 0;
    reporte.valoraciones_no_utiles = valoraciones[0].no_utiles || 0;

    res.json(reporte);
  } catch (err) {
    console.error('Error al obtener reporte con imágenes y valoraciones:', err);
    res.status(500).json({ error: 'Error al obtener el reporte', detalle: err.message });
  }
};


// imagenes
const cloudinary = require('../config/cloudinary');

const eliminarReporte = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener imágenes asociadas al reporte
    const [imagenes] = await db.promise().query(
      'SELECT public_id FROM ImagenesReporte WHERE id_reporte = ?',
      [id]
    );

    // 2. Eliminar imágenes de Cloudinary
    for (const img of imagenes) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        console.log(`Imagen eliminada de Cloudinary: ${img.public_id}`);
      } catch (err) {
        console.warn(`Error eliminando imagen en Cloudinary (${img.public_id}):`, err.message);
      }
    }

    // 3. Eliminar registros de imágenes en BD
    await db.promise().query('DELETE FROM ImagenesReporte WHERE id_reporte = ?', [id]);

    // 4. Eliminar el reporte
    const [result] = await db.promise().query('DELETE FROM reportes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.status(200).json({ mensaje: 'Reporte e imágenes eliminadas correctamente' });
  } catch (err) {
    console.error('Error al eliminar reporte e imágenes:', err);
    res.status(500).json({ error: 'Error interno al eliminar el reporte' });
  }
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



