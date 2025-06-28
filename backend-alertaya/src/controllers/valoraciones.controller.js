const db = require('../config/db');

// Crear o actualizar una valoración
const valorarReporte = (req, res) => {
  const usuarioEmail = req.user?.email;
  const reporteId = req.params.id;
  const { utilidad } = req.body; // tiene que venir como 'util' o 'no_util'

  if (!usuarioEmail || !reporteId || !['util', 'no_util'].includes(utilidad)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const fecha = new Date();

  const sql = `
  INSERT INTO valoraciones (reporte_id, usuario_email, utilidad, fecha)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE utilidad = VALUES(utilidad), fecha = VALUES(fecha)
`;

  db.query(sql, [reporteId, usuarioEmail, utilidad, fecha], (err) => {
    if (err) return res.status(500).json({ error: 'Error al registrar valoración' });
    res.status(200).json({ mensaje: 'Valoración registrada' });
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

module.exports = { valorarReporte, obtenerResumenValoraciones, obtenerValoracionUsuario };
