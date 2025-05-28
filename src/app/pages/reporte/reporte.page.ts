import { Component } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocalizacion.service';
import { PermisosGPSInternetService } from 'src/app/services/permisos.service';
import { ToastController } from '@ionic/angular';
import { ReporteService, Reporte } from 'src/app/services/reporte.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: false
})
export class ReportePage {

  descripcion: string = '';
  ubicacion: { lat: number; lng: number } | null = null;
  error: string = '';
  gpsListo: boolean = false;
  cargando: boolean = true;
  categoriaSeleccionada: string = '';

  constructor(
    private geoService: GeolocationService,
    private permisosService: PermisosGPSInternetService,
    private toastController: ToastController,
    private reporteService: ReporteService
  ) { }

  async ngOnInit() {
    this.error = '';
    this.gpsListo = false;
    this.cargando = true;
    this.ubicacion = null;

    try {
      const gpsOk = await this.permisosService.verificarGPSyPermisos();
      const conexionOk = await this.permisosService.verificarConexionInternet('Se requiere conexión a internet');

      if (!gpsOk || !conexionOk) {
        this.error = 'Debes activar el GPS y tener conexión a internet para continuar.';
        return;
      }

      const ubicacion = await this.geoService.getCurrentPosition();
      if (ubicacion) {
        this.ubicacion = {
          lat: ubicacion.lat,
          lng: ubicacion.lon
        };
        console.log('Ciudad:', ubicacion.ciudad);
        console.log('Hora:', ubicacion.fechaHora);
        this.gpsListo = true;
      } else {
        this.error = 'No se pudo obtener la ubicación.';
      }

    } catch (e) {
      this.error = 'Error general verificando permisos.';
    } finally {
      this.cargando = false;
    }
  }

  // 🔍 Generador de URL segura para iframe
  get mapaPreviewUrl(): string {
    if (!this.ubicacion) return '';
    return `https://www.google.com/maps?q=${this.ubicacion.lat},${this.ubicacion.lng}&z=16&output=embed`;
  }

  reintentarVerificacion() {
    this.ngOnInit(); // Reinicia todo el flujo
  }

  async enviarReporte() {
    this.error = '';

    const gpsOk = await this.permisosService.verificarGPSyPermisos();
    const conexionOk = await this.permisosService.verificarConexionInternet('Se requiere conexión a internet');

    if (!gpsOk || !conexionOk) {
      this.mostrarMensaje('Algo falló, revise su conexión a internet y GPS', 'danger')
      return
    };

    const ubicacionActual = await this.geoService.getCurrentPosition();
    if (!ubicacionActual) {
      this.error = 'No se pudo obtener la ubicación actual.';
      return;
    }

    const ciudad = await this.geoService.obtenerCiudad(ubicacionActual.lat, ubicacionActual.lon);
    const fechaHora = new Date().toISOString().split('.')[0]; // sin milisegundos '2025-05-23T01:01:08'

    const nuevoReporte: Reporte = {
      descripcion: this.descripcion,
      lat: ubicacionActual.lat,
      lng: ubicacionActual.lon,
      ciudad: ciudad || 'Desconocida',
      fechaHora,
      enviado: true,
      categoria: this.categoriaSeleccionada
    };

    if (this.descripcion.trim().length < 20) {
      this.mostrarMensaje('El reporte debe tener al menos 20 caractéres.', 'warning');
      return;
    }

    if (!this.categoriaSeleccionada) {
      this.mostrarMensaje('Debes seleccionar la categoría del reporte.', 'warning');
      return;
    }

    try {
      await this.reporteService.guardarReporte(nuevoReporte);
      const actualizado = await this.reporteService.getReportesLocales();
      const ultimo = actualizado[actualizado.length - 1];

      if (ultimo.enviado) {
        this.mostrarMensaje('Reporte enviado con éxito', 'success');
      } else {
        this.mostrarMensaje('Algo falló, revise su conexión a internet y GPS', 'danger')
      }

    } catch (err) {
      this.mostrarMensaje('Ocurrió un error inesperado', 'danger');
    }

    this.descripcion = '';
    this.categoriaSeleccionada = '';
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
