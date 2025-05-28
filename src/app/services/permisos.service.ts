/**
 * Servicio para gestionar los permisos de GPS y la conexión a internet en la aplicación.
 * Se encarga de verificar si el usuario tiene activado el GPS y los permisos de ubicación,
 * así como comprobar si hay conexión a internet antes de realizar ciertas acciones.
 * 
 * - verificarGPSyPermisos(): Verifica si los permisos de ubicación están otorgados y si el GPS está activo.
 *   Si no están activados, solicita los permisos y muestra un mensaje en caso de fallo.
 * 
 * - verificarConexionInternet(mensaje): Comprueba si el dispositivo tiene conexión a internet.
 *   Si no está conectado, muestra un mensaje con la advertencia.
 * 
 * - mostrarMensaje(mensaje, color): Muestra un mensaje en pantalla con el color especificado.
 */

import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';

@Injectable({
    providedIn: 'root',
})

export class PermisosGPSInternetService {

    constructor(private toastController: ToastController) { }

    // Agregar función para verificar GPS y permisos
    async verificarGPSyPermisos(): Promise<boolean> {
        try {
            // Verificar permisos actuales
            const gpsActivo = await Geolocation.checkPermissions();
            if (gpsActivo.location !== 'granted') {
                // Solicitar permisos si no están otorgados
                const permiso = await Geolocation.requestPermissions();
                if (permiso.location !== 'granted') {
                    this.mostrarMensaje('Debe otorgar permisos de ubicación para crear informe', 'warning');
                    return false;
                }
            }
            // Intentar obtener la ubicación para verificar si el GPS está activo
            const estadoGPS = await Geolocation.getCurrentPosition();
            if (!estadoGPS) {
                this.mostrarMensaje('Debe activar el GPS para continuar', 'warning');
                return false;
            }
            return true; // Permisos y GPS están correctos
        } catch (error) {
            this.mostrarMensaje('Debe activar el GPS para continuar', 'warning');
            return false;
        }
    }

    // Verificar conexión a internet
    async verificarConexionInternet(mensaje: string): Promise<boolean> {
        try {
            const status = await Network.getStatus();
            if (status.connected) {
                return true; // Está conectado a internet
            } else {
                this.mostrarMensaje(mensaje, 'warning');
                return false;
            }
        } catch (error) {
            this.mostrarMensaje('Debe conectarse a internet para continuar.', 'warning');
            return false;
        }
    }

    //FUNCION PARA LOS MENSAJES
    async mostrarMensaje(mensaje: string, color: string) {
        const toast = await this.toastController.create({
            message: mensaje,
            color: color,
            duration: 3000
        });
        toast.present();
    }
}
