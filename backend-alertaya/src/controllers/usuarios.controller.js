const db = require('../config/db');

const actualizarTokenYUbicacion = (req, res) => {
  const email = req.user?.email;
  const { tokenFCM, lat, lng } = req.body;

  if (!email || !tokenFCM) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const sql = `
    UPDATE usuarios
    SET tokenFCM = ?, ultimaLat = ?, ultimaLng = ?
    WHERE email = ?
  `;

  db.query(sql, [tokenFCM, lat || null, lng || null, email], (err, result) => {
    if (err) {
      console.error('Error al actualizar token o ubicación:', err);
      return res.status(500).json({ error: 'Error al actualizar datos' });
    }

    res.json({ mensaje: 'Token y ubicación actualizados' });
  });
};

module.exports = { actualizarTokenYUbicacion };
