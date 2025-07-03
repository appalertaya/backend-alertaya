
const admin = require('../config/firebase');
const haversine = require('haversine-distance');

async function enviarNotificacionesUsuariosCercanos({ lat, lng, ciudad, categoria }, usuarios) {
  const puntoReporte = { latitude: parseFloat(lat), longitude: parseFloat(lng) };

  const usuariosCercanos = usuarios.filter((usuario) => {
    const puntoUsuario = {
      latitude: parseFloat(usuario.lat),
      longitude: parseFloat(usuario.lng),
    };
    const distancia = haversine(puntoReporte, puntoUsuario);
    return distancia <= 10000; // 10 km
  });

  console.log(`➡️ Usuarios dentro de 10 km: ${usuariosCercanos.length}`);

  for (const usuario of usuariosCercanos) {
    const message = {
      notification: {
        title: `Nuevo reporte cercano: ${categoria}`,
        body: `Se registró un incidente en tu zona (${ciudad}).`,
      },
      token: usuario.tokenFCM,
    };

    try {
      await admin.messaging().send(message);
      console.log(`✅ Notificación enviada a: ${usuario.tokenFCM}`);
    } catch (err) {
      console.warn(`⚠️ Error al enviar notificación: ${err.message}`);
    }
  }
}

module.exports = enviarNotificacionesUsuariosCercanos;
