import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ToastController } from '@ionic/angular';
import { ConfigService } from './config.service';

export interface Reporte {
  id?: number;
  descripcion: string;
  lat: number;
  lng: number;
  ciudad: string;
  fechaHora: string;
  enviado: boolean;
  categoria: string;
  imagenUrl?: string;
  creadorEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private STORAGE_KEY = 'reportes';

  private apiUrl = `${environment.backendUrl}/api/reportes`;


  constructor(private http: HttpClient, private toastController: ToastController, private configService: ConfigService) { }

  async guardarReporte(formData: FormData): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    const reportesLocales: Reporte[] = value ? JSON.parse(value) : [];

    const { value: userEmail } = await Preferences.get({ key: 'email' });

    // Extraer los datos del formulario para guardar copia local
    const nuevoReporte: Reporte = {
      descripcion: formData.get('descripcion') as string,
      lat: parseFloat(formData.get('lat') as string),
      lng: parseFloat(formData.get('lng') as string),
      ciudad: formData.get('ciudad') as string,
      fechaHora: formData.get('fechaHora') as string,
      enviado: true,
      categoria: formData.get('categoria') as string,
      creadorEmail: userEmail ?? undefined
    };

    try {
      const { value: token } = await Preferences.get({ key: 'token' });

      const headers = {
        Authorization: `Bearer ${token}`
      };

      await this.http.post(this.apiUrl, formData, { headers }).toPromise();
      console.log('✅ Reporte enviado al backend correctamente');

      reportesLocales.push(nuevoReporte);

    } catch (error: any) {
      console.warn('⚠️ No se pudo enviar el reporte al backend. Guardando localmente.', error);
      nuevoReporte.enviado = false;
      reportesLocales.push(nuevoReporte);
    }

    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(reportesLocales)
    });
  }



  getReportePorId(id: number): Promise<Reporte | undefined> {
    return this.http.get<Reporte>(`${this.apiUrl}/${id}`).toPromise()
      .catch(err => {
        console.warn('No se encontró el reporte con ID:', id, err);
        return undefined;
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

  async eliminarReporteBackend(id: number): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    try {
      const { value: token } = await Preferences.get({ key: 'token' });
      // console.log('TOKEN ACTUAL:', value);
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      await this.http.delete(`${this.apiUrl}/${id}`, { headers }).toPromise();
      console.log('Reporte id:', id, ' eliminado correctamente');
    } catch (error: any) {
      console.warn('No se pudo eliminar el reporte del backend.', error);
    }
  }


  // Sincronizar reportes pendientes
  async sincronizarReportesPendientes(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      let reportes: Reporte[] = value ? JSON.parse(value) : [];

      console.log("reportes a sincronizar: ", reportes)

      // Obtener correo del usuario actual
      const { value: userEmail } = await Preferences.get({ key: 'email' });
      const correoActual = userEmail ?? undefined;

      if (!correoActual) {
        console.warn('No hay usuario autenticado, no se sincronizan reportes');
        return false;
      }

      // Filtrar solo reportes pendientes del usuario actual
      const pendientes = reportes.filter(r => !r.enviado && r.creadorEmail === correoActual);
      if (pendientes.length === 0) return false;

      const { value: token } = await Preferences.get({ key: 'token' });
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      // console.log('Authorization Header:', headers.get('Authorization'));

      console.log(`Intentando sincronizar ${pendientes.length} reporte(s) pendiente(s) del usuario ${correoActual}...`);

      for (const r of pendientes) {
        try {
          await this.http.post(this.apiUrl, r, { headers }).toPromise();

          // Buscar el índice real en el array 'reportes' y actualizarlo
          const index = reportes.findIndex(orig =>
            orig.fechaHora === r.fechaHora &&
            orig.lat === r.lat &&
            orig.lng === r.lng &&
            orig.descripcion === r.descripcion
          );

          if (index !== -1) {
            reportes[index].enviado = true;
            console.log('Reporte sincronizado:', reportes[index].fechaHora);
          }
        } catch (err) {
          console.warn('No se pudo sincronizar reporte:', r.fechaHora, ' Error: ', err);
        }
      }

      // Eliminar reportes que ya fueron sincronizados (enviados = true)
      const noEnviados = reportes.filter(r => !r.enviado);

      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(noEnviados)
      });

      return true;
    } catch (error) {
      console.warn('Ocurrió un error al sincronizar los reportes: ', error)
      return false;
    }
  }

  // get reportes por usuario 
  async getMisReportes(): Promise<Reporte[]> {
    const { value: token } = await Preferences.get({ key: 'token' });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    try {
      const reportes = await this.http.get<Reporte[]>(`${this.apiUrl}/mios`, { headers }).toPromise();
      return reportes || [];
    } catch (error) {
      console.error('Error al obtener reportes del usuario:', error);
      return [];
    }
  }

  getCantidadPorCategoria() {
    return this.http.get<{ categoria: string; cantidad: number }[]>(`${this.apiUrl}/categorias/cantidad`);
  }

  subirReporteConImagenes(formData: FormData) {
    const token = localStorage.getItem('token'); // o Preferences si usas Capacitor

    return this.http.post(`${this.apiUrl}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).toPromise();
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
