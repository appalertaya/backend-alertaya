import { Injectable } from '@angular/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';

const BACKEND_URL = 'https://backend-alertaya.onrender.com';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private http: HttpClient) {}

  async registrarNotificaciones(ubicacion: { lat: number, lng: number }) {
    try {
      const permisos = await PushNotifications.requestPermissions();
      if (permisos.receive !== 'granted') {
        console.warn('Permiso de notificaciones no concedido');
        return;
      }

      // Registrarse para recibir token
      await PushNotifications.register();

      // Escuchar el token y enviarlo al backend
      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Token FCM recibido:', token.value);

        const { value: jwt } = await Preferences.get({ key: 'token' });

        const headers = new HttpHeaders({
          Authorization: `Bearer ${jwt}`,
        });

        try {
          await this.http.put(`${BACKEND_URL}/api/usuarios/token`, {
            tokenFCM: token.value,
            lat: ubicacion.lat,
            lng: ubicacion.lng
          }, { headers }).toPromise();

          console.log('Token y ubicación enviados al backend');

        } catch (err) {
          console.warn('Error al enviar token al backend:', err);
        }
      });

      // Manejar errores de registro
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error al registrar notificaciones push:', error);
      });

    } catch (e) {
      console.error('Error en registrarNotificaciones:', e);
    }
  }
}
