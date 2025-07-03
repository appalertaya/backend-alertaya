import { Component } from '@angular/core';
import { GeolocationService } from 'src/app/services/geolocalizacion.service';
import { PermisosGPSInternetService } from 'src/app/services/permisos.service';
import { ToastController } from '@ionic/angular';
import { ReporteService } from 'src/app/services/reporte.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { PushNotificationService } from 'src/app/services/push-notification.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: false
})
export class ReportePage {

  descripcion: string = '';
  ubicacion: { lat: number; lng: number } | null = null;
  mostrarCoords: boolean = false;
  error: string = '';
  gpsListo: boolean = false;
  cargando: boolean = true;
  categoriaSeleccionada: string = '';
  imagenes: File[] = [];
  enviar: boolean = false;

  constructor(
    private geoService: GeolocationService,
    private permisosService: PermisosGPSInternetService,
    private toastController: ToastController,
    private reporteService: ReporteService,
    private notificacionesService: NotificacionesService,
    private pushService: PushNotificationService
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

      // para sincronizar reportes pendientes 
      // const sincronizar = this.reporteService.sincronizarReportesPendientes();
      // if (await sincronizar) {
      //   this.mostrarMensaje('Reportes pendientes sincronizados con éxito.', 'success')
      // } else {
      //   console.log("No se pudieron sincronizar los reportes pendientes.")
      // }

      const ubicacion = await this.geoService.getCurrentPosition();
      if (ubicacion) {
        this.ubicacion = {
          lat: ubicacion.lat,
          lng: ubicacion.lon
        };
        console.log('Ciudad:', ubicacion.ciudad);
        console.log('Hora:', ubicacion.fechaHora);
        this.gpsListo = true;
        // await this.notificacionesService.registrarNotificaciones(this.ubicacion);
        await this.pushService.initPush(this.ubicacion);
        
      } else {
        this.error = 'No se pudo obtener la ubicación.';
      }

    } catch (e) {
      this.error = 'Error general verificando permisos.';
    } finally {
      this.cargando = false;
    }
  }

  // Generador de URL segura para iframe
  get mapaPreviewUrl(): string {
    if (!this.ubicacion) return '';
    return `https://www.google.com/maps?q=${this.ubicacion.lat},${this.ubicacion.lng}&z=16&output=embed`;
  }

  reintentarVerificacion() {
    this.ngOnInit(); // Reinicia todo el flujo
  }

  async enviarReporte() {
    this.error = '';

    if (this.descripcion.trim().length < 20) {
      this.mostrarMensaje('El reporte debe tener al menos 20 caractéres.', 'warning');
      return;
    }

    if (!this.categoriaSeleccionada) {
      this.mostrarMensaje('Debes seleccionar la categoría del reporte.', 'warning');
      return;
    }

    if (this.imagenes.length < 2) {
      this.mostrarMensaje('Debes adjuntar al menos 2 imágenes.', 'warning');
      return;
    }

    const gpsOk = await this.permisosService.verificarGPSyPermisos();
    if (!gpsOk) {
      this.mostrarMensaje('Debes activar el GPS para enviar un reporte.', 'danger');
      return;
    }

    const ubicacionActual = await this.geoService.getCurrentPosition();
    if (!ubicacionActual) {
      this.error = 'No se pudo obtener la ubicación actual.';
      return;
    }

    try {

      this.enviar = true;

      const ciudad = await this.geoService.obtenerCiudad(ubicacionActual.lat, ubicacionActual.lon);
      const fechaHora = new Date().toISOString().split('.')[0];

      const formData = new FormData();
      formData.append('descripcion', this.descripcion);
      formData.append('lat', String(ubicacionActual.lat));
      formData.append('lng', String(ubicacionActual.lon));
      formData.append('ciudad', ciudad || 'Desconocida');
      formData.append('fechaHora', fechaHora);
      formData.append('enviado', 'true');
      formData.append('categoria', this.categoriaSeleccionada);

      this.imagenes.forEach((img, index) => {
        formData.append('imagenes', img);
      });

      await this.reporteService.guardarReporte(formData);
      this.mostrarMensaje('Reporte enviado con éxito', 'success');
      this.descripcion = '';
      this.categoriaSeleccionada = '';
      this.imagenes = [];
    } catch (err) {
      this.mostrarMensaje('Ocurrió un error inesperado', 'danger');
    } finally {
      this.enviar = false;
    }
  }



  onImagenesSeleccionadas(event: any) {
    const archivos: FileList = event.target.files;

    this.imagenes = [];
    for (let i = 0; i < archivos.length; i++) {
      this.imagenes.push(archivos[i]);
    }

    if (this.imagenes.length < 2) {
      this.mostrarMensaje('Debes seleccionar al menos 2 imágenes.', 'warning');
    }
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
