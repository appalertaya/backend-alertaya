/**
 * Servicio para gestionar la geolocalización en la aplicación.
 * Permite obtener la posición actual del usuario, incluyendo latitud, longitud,
 * el nombre de la ciudad y la hora local mediante APIs externas.
 * 
 * - requestPermissions(): Solicita permisos de geolocalización al usuario.
 * 
 * - getCurrentPosition(): Obtiene la ubicación actual, verificando primero los permisos.
 *   Devuelve la latitud, longitud, la hora local y el nombre de la ciudad.
 * 
 * - obtenerCiudad(lat, lon): Usa la API de OpenWeatherMap para obtener el nombre de la ciudad
 *   en función de las coordenadas proporcionadas.
 * 
 * - obtenerHoraLocal(lat, lon): Usa una API de zona horaria para calcular la hora local
 *   según la ubicación del usuario.
 * 
 * - obtenerHoraDispositivo(): Obtiene la hora actual del dispositivo en formato legible.
 */

import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor(private http: HttpClient) { }

  private apiKey = 'df6bcad230b1cc8b199e0ebc07b1cd8b'; // clave de api de openweathermap (la clave llega al correo al crear una cuenta en la pagina) https://home.openweathermap.org/api_keys
  private timezoneApiKey = 'MNKUGOG60PAH'; // Clave de API para TimeZoneDB o similar (la clave llega al correo al crear una cuenta en la pagina)

  // Solicita permisos de geolocalización
  async requestPermissions(): Promise<boolean> {
    try {
      const permiso = await Geolocation.requestPermissions();
      return permiso.location === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de geolocalización:', error);
      return false;
    }
  }

  // Obtiene la posición actual con hora local y nombre de la ciudad
  async getCurrentPosition(): Promise<{
    lat: number;
    lon: number;
    fechaHora: string;
    ciudad: string;
  } | null> {
    try {
      // Solicita permisos
      const permisosConcedidos = await this.requestPermissions();
      if (!permisosConcedidos) {
        console.warn('Permisos de geolocalización no concedidos');
        return null;
      }

      // Obtiene la posición
      const posicion = await Geolocation.getCurrentPosition();

      // Variables para almacenar los valores
      let ciudad = 'Desconocida';
      let fechaHora = new Date().toLocaleString('es-CL', { hour12: true });

      try {
        // Intentar obtener la ciudad
        ciudad = await this.obtenerCiudad(posicion.coords.latitude, posicion.coords.longitude) || 'Desconocida';
      } catch (error) {
        console.warn('No se pudo obtener la ciudad. Revisa la conexión a internet', error);
      }

      try {
        // Intentar obtener hora dispositivo
        fechaHora = await this.obtenerHoraDispositivo();
        // Intentar obtener la hora local
        // fechaHora = await this.obtenerHoraLocal(posicion.coords.latitude, posicion.coords.longitude);
      } catch (error) {
        console.warn('No se pudo obtener la hora', error);
        // console.warn('No se pudo obtener la hora desde la API. Usando hora del dispositivo', error);
      }

      return {
        lat: posicion.coords.latitude,
        lon: posicion.coords.longitude,
        fechaHora,
        ciudad
      };
    } catch (error) {
      console.error('Error obteniendo la geolocalización:', error);
      return null;
    }
  }

  // Obtiene la ciudad usando OpenWeatherMap
  async obtenerCiudad(lat: number, lon: number): Promise<string | null> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&lang=es`;
    try {
      const respuesta: any = await this.http.get(url).toPromise();
      return respuesta.name || null;
    } catch (error) {
      console.error('Error obteniendo la ciudad desde OpenWeatherMap:', error);
      return null;
    }
  }

  // Obtiene la hora local usando una API de zona horaria (por ejemplo, TimeZoneDB)
  private async obtenerHoraLocal(lat: number, lon: number): Promise<string> {
    const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${this.timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;
    try {
      // Realizar la llamada a la API
      const respuesta: any = await firstValueFrom(this.http.get(url));

      // Obtener el desplazamiento GMT (en segundos)
      const gmtOffset = respuesta.gmtOffset; // Tiempo en segundos
      if (gmtOffset === undefined) {
        throw new Error('No se pudo obtener el desplazamiento GMT.');
      }

      // Obtener la hora actual en UTC
      const horaUTC = new Date();
      // Calcular la hora local ajustada
      const horaLocal = new Date(horaUTC.getTime() + gmtOffset * 1000);
      // Formatear la fecha y hora a un formato legible
      const opcionesFormato: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      // Usar `Intl.DateTimeFormat` sin forzar UTC
      const formatoLegible = new Intl.DateTimeFormat('es-CL', opcionesFormato).format(horaUTC); // formato (DD-MM-YYYY HH:mm:ss)
      return formatoLegible.replace(',', ''); // Formateo limpio
    } catch (error) {
      console.error('Error obteniendo la hora local:', error);
      return new Date().toLocaleString('es-CL', { hour12: true });
    }
  }

  private obtenerHoraDispositivo() {
    const opcionesFormato: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24 horas
    };

    return new Intl.DateTimeFormat('es-CL', opcionesFormato).format(new Date()).replace(',', '');
  }
}
