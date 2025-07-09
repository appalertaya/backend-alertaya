const db = require('../config/db');

// Crear o actualizar una valoración
const valorarReporte = (req, res) => {
  const usuarioEmail = req.user?.email;
  const reporteId = req.params.id;
  const { utilidad } = req.body; // debe ser 'util' o 'no_util'

  if (!usuarioEmail || !reporteId || !['util', 'no_util', null].includes(utilidad)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const fecha = new Date();

  const sqlInsert = `
    INSERT INTO valoraciones (reporte_id, usuario_email, utilidad, fecha)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE utilidad = VALUES(utilidad), fecha = VALUES(fecha)
  `;

  db.query(sqlInsert, [reporteId, usuarioEmail, utilidad, fecha], (err) => {
    if (err) return res.status(500).json({ error: 'Error al registrar valoración' });

    // Contar tanto útiles como no útiles
    const sqlContarAmbos = `
      SELECT
        SUM(utilidad = 'util') AS utiles,
        SUM(utilidad = 'no_util') AS no_utiles
      FROM valoraciones
      WHERE reporte_id = ?
    `;

    db.query(sqlContarAmbos, [reporteId], (err2, resultados) => {
      if (err2) return res.status(500).json({ error: 'Valor registrada, pero error al contar votos' });

      const utiles = Number(resultados[0].utiles || 0);
      const noUtiles = Number(resultados[0].no_utiles || 0);
      const umbral = 5;

      // Solo es confiable si hay al menos 5 útiles y más que los no útiles
      const esConfiable = utiles >= umbral && utiles > noUtiles ? 1 : 0;

      const sqlUpdate = `UPDATE reportes SET esConfiable = ? WHERE id = ?`;

      db.query(sqlUpdate, [esConfiable, reporteId], (err3) => {
        if (err3) {
          return res.status(500).json({ error: 'Valor registrada, pero error al actualizar confiabilidad' });
        }

        return res.status(200).json({
          mensaje: 'Valoración registrada',
          confiable: esConfiable === 1,
          utiles,
          noUtiles
        });
      });
    });
  });
};

// obtener valoracion de usuario 
const obtenerValoracionUsuario = (req, res) => {
  const userEmail = req.user?.email;  // Email en lugar de id
  const reporteId = req.params.reporteId;

  if (!userEmail || !reporteId) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  db.query(
    'SELECT * FROM valoraciones WHERE reporte_id = ? AND usuario_email = ?',
    [reporteId, userEmail],
    (err, resultados) => {
      if (err) return res.status(500).json({ error: 'Error al obtener valoración' });
      if (resultados.length === 0) return res.json({ valorado: false });
      res.json({ valorado: true, util: resultados[0].utilidad }); // cuidado: es 'utilidad'
    }
  );
};


// Obtener resumen de valoraciones para un reporte
const obtenerResumenValoraciones = (req, res) => {
  const reporteId = req.params.id;

  const sql = `
    SELECT
      SUM(CASE WHEN utilidad = 'util' THEN 1 ELSE 0 END) AS utiles,
      SUM(CASE WHEN utilidad = 'no_util' THEN 1 ELSE 0 END) AS no_utiles
    FROM valoraciones
    WHERE reporte_id = ?
  `;

  db.query(sql, [reporteId], (err, results) => {
    if (err) {
      console.error('Error al obtener resumen de valoraciones:', err);
      return res.status(500).json({ error: 'Error al obtener valoraciones' });
    }
    res.status(200).json(results[0]);
  });
};

// eliminar valoracion
const eliminarValoracion = (req, res) => {

  const userEmail = req.user?.email;
  const reporteId = req.params.id;

  console.log('Eliminando valoración del usuario:', userEmail, 'para el reporte:', reporteId);

  if (!userEmail || !reporteId) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const sql = 'DELETE FROM valoraciones WHERE reporte_id = ? AND usuario_email = ?';

  db.query(sql, [reporteId, userEmail], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar valoración' });
    res.status(200).json({ mensaje: 'Valoración eliminada' });
  });
};




module.exports = { valorarReporte, obtenerResumenValoraciones, obtenerValoracionUsuario, eliminarValoracion };
