import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor() {}

  async initPush() {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return;
    }

    PushNotifications.register();

    // Registro exitoso, obtienes el token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token de dispositivo:', token.value);
      // Aquí podrías enviar el token a tu backend si deseas enviarle notificaciones específicas
    });

    // Error al registrar
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error de registro:', error);
    });

    // Notificación recibida en primer plano
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Notificación recibida:', notification);
      // Puedes mostrar un toast o alerta aquí si lo deseas
    });

    // Acción realizada al tocar la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Notificación pulsada:', notification.notification);
    });
  }
}
