import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ToastController } from '@ionic/angular';
import { ConfigService } from './config.service';

export interface Reporte {
  descripcion: string;
  lat: number;
  lng: number;
  ciudad: string;
  fechaHora: string;
  enviado: boolean;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private STORAGE_KEY = 'reportes';

  private apiUrl = `${environment.backendUrl}/api/reportes`;


  constructor(private http: HttpClient, private toastController: ToastController, private configService: ConfigService) { }

  async guardarReporte(reporte: Reporte): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    const reportesLocales: Reporte[] = value ? JSON.parse(value) : [];

    try {
      await this.http.post(this.apiUrl, reporte).toPromise();
      console.log('Reporte enviado al backend correctamente');
      reportesLocales.push({ ...reporte, enviado: true });
    } catch (error: any) {
      console.warn('No se pudo enviar el reporte al backend. Guardando localmente.', error);
      if (error.status === 0) {
        console.warn('❌ El servidor no está disponible.');
      } else {
        console.warn('❌ Error al insertar reporte:', error);
      }
      reportesLocales.push({ ...reporte, enviado: false });
    }

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(reportesLocales)
    });
  }

  getReportesDesdeBackend(params: {
    lat?: number;
    lng?: number;
    radio?: number;
    categoria?: string;
    ciudad?: string;
  }) {
    let httpParams = new HttpParams();
    for (const key in params) {
      const val = params[key as keyof typeof params];
      if (val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    }
    return this.http.get<Reporte[]>(this.apiUrl, { params: httpParams });
  }

  async getReportesLocales(): Promise<Reporte[]> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async limpiarReportes(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
  }

  async eliminarReportePorFecha(fechaHora: string): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    let reportes: Reporte[] = value ? JSON.parse(value) : [];

    reportes = reportes.filter(r => r.fechaHora !== fechaHora);

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(reportes)
    });
  }

  // Sincronizar reportes pendientes
  async sincronizarReportesPendientes(): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    let reportes: Reporte[] = value ? JSON.parse(value) : [];

    const pendientes = reportes.filter(r => !r.enviado);
    if (pendientes.length === 0) return;

    console.log(`🔄 Intentando sincronizar ${pendientes.length} reporte(s) pendiente(s)...`);

    for (const r of pendientes) {
      try {
        await this.http.post(this.apiUrl, r).toPromise();
        r.enviado = true;
        console.log('Reporte sincronizado:', r.fechaHora);
      } catch (err) {
        console.warn('No se pudo sincronizar reporte:', r.fechaHora, ' Error: ', err);
      }
    }

    // Guardar nuevamente los datos actualizados
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(reportes)
    });
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: color,
      duration: 3000
    });
    toast.present();
  }
}
