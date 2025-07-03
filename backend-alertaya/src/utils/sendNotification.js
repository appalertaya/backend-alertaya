const admin = require('../config/firebase');
const haversine = require('haversine-distance');

/**
 * Envía notificaciones a los usuarios ubicados dentro de un radio de 10 km.
 * @param {Object} datosReporte - Contiene lat, lng, ciudad, categoria.
 * @param {Array} usuarios - Usuarios con tokenFCM y ubicación registrada.
 */
async function enviarNotificacionesUsuariosCercanos(datosReporte, usuarios) {
    console.log("datosReporte: ", datosReporte)
    const { lat, lng, ciudad, categoria } = datosReporte;
    const puntoReporte = { latitude: parseFloat(lat), longitude: parseFloat(lng) };

    const usuariosCercanos = usuarios.filter(usuario => {
        const puntoUsuario = {
            latitude: parseFloat(usuario.ultimaLat),
            longitude: parseFloat(usuario.ultimaLng),
        };
        const distancia = haversine(puntoReporte, puntoUsuario); // metros
        return distancia <= 10000; // máximo 10 km
    });

    console.log(`Usuarios dentro de 10 km: ${usuariosCercanos.length}`);

    for (const usuario of usuariosCercanos) {
        const message = {
            notification: {
                title: `Nuevo reporte cercano: ${categoria}`,
                body: `Se registró un incidente en tu zona (${ciudad}).`,
            },
            token: usuario.tokenFCM,
            android: {
                priority: 'high'  // Esto mejora la entrega inmediata
            }
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
