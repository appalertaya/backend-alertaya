import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  ActionPerformed,
  PushNotificationSchema
} from '@capacitor/push-notifications';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';

const BACKEND_URL = 'https://backend-alertaya.onrender.com';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(private http: HttpClient) {}

  async initPush(ubicacion: { lat: number; lng: number }) {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return;
    }

    await PushNotifications.register();

    // Se dispara solo una vez
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Token de dispositivo:', token.value);

      try {
        const { value: jwt } = await Preferences.get({ key: 'token' });

        const headers = new HttpHeaders({
          Authorization: `Bearer ${jwt}`,
        });

        await this.http.put(`${BACKEND_URL}/api/usuarios/token`, {
          tokenFCM: token.value,
          lat: ubicacion.lat,
          lng: ubicacion.lng
        }, { headers }).toPromise();
        
        console.log('Token y ubicación enviados al backend');

      } catch (error) {
        console.error('Error al enviar token al backend:', error);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error de registro:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Notificación recibida:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Notificación pulsada:', notification.notification);
    });
  }
}
