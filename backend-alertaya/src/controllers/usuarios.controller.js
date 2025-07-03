const db = require('../config/db');

const actualizarTokenYUbicacion = (req, res) => {
    const email = req.user?.email;
    const { tokenFCM, lat, lng } = req.body;
    console.log("email: ", email)
    console.log("tokenFCM: ", tokenFCM)
    console.log("lat: ", lat)
    console.log("lng: ", lng)
    if (!email || !tokenFCM) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    console.log("🟡 Petición recibida para actualizar token de:", email);

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

// controllers/usuarios.controller.js
const getPerfilUsuario = async (req, res) => {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: 'No autorizado' });

    try {
        const [rows] = await db.promise().query(
            'SELECT nombre, correo FROM usuarios WHERE id = ?',
            [usuarioId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el perfil', detalle: err.message });
    }
};

const actualizarPerfilUsuario = async (req, res) => {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: 'No autorizado' });

    const { nombre, correo } = req.body;
    if (!nombre || !correo) return res.status(400).json({ error: 'Faltan campos requeridos' });

    try {
        await db.promise().query(
            'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
            [nombre, correo, usuarioId]
        );
        res.json({ mensaje: 'Perfil actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar perfil', detalle: err.message });
    }
};

module.exports = { actualizarTokenYUbicacion, getPerfilUsuario, actualizarPerfilUsuario };
