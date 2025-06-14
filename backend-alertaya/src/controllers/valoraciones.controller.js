const db = require('../config/db');

// Crear o actualizar una valoración
const valorarReporte = (req, res) => {
  const { reporteId, valor } = req.body;
  const usuarioId = req.user.id; // obtenido del middleware

  if (![1, -1].includes(valor)) {
    return res.status(400).json({ error: 'Valor no válido.' });
  }

  const sql = `
    INSERT INTO valoraciones (usuario_id, reporte_id, valor)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE valor = VALUES(valor)
  `;

  db.query(sql, [usuarioId, reporteId, valor], (err, result) => {
    if (err) {
      console.error('Error al valorar reporte:', err);
      return res.status(500).json({ error: 'Error al valorar reporte' });
    }
    res.status(200).json({ mensaje: 'Valoración registrada' });
  });
};

// Obtener resumen de valoraciones para un reporte
const obtenerResumenValoraciones = (req, res) => {
  const reporteId = req.params.id;

  const sql = `
    SELECT
      SUM(CASE WHEN valor = 1 THEN 1 ELSE 0 END) AS utiles,
      SUM(CASE WHEN valor = -1 THEN 1 ELSE 0 END) AS no_utiles
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

module.exports = { valorarReporte, obtenerResumenValoraciones };
