import { Component, OnInit } from '@angular/core';
import { ReporteService, Reporte } from 'src/app/services/reporte.service';
import { AlertController, ToastController } from '@ionic/angular';
import { PermisosGPSInternetService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {

  reportes: Reporte[] = [];
  filtroCategoria: string = '';
  error: string = '';
  conexionLista: boolean = false;
  cargando: boolean = true;

  pendientesLocales: Reporte[] = [];
  apiFallo: boolean = false;


  categorias: string[] = [
    'Corte de luz',
    'Corte de agua',
    'Semáforo en mal estado',
    'Paradero dañado',
    'Alumbrado público',
    'Fuga o filtración',
    'Calzada o vereda rota',
    'Otros'
  ];

  constructor(
    private reporteService: ReporteService,
    private alertController: AlertController,
    private toastController: ToastController,
    private permisosService: PermisosGPSInternetService
  ) { }

  async ngOnInit() {
    this.error = '';
    this.cargando = true;
    this.conexionLista = false;
    await this.cargarReportes();
  }

  // Cargar reportes 
  async cargarReportes() {
    try {
      const conexionOk = await this.permisosService.verificarConexionInternet('Se requiere conexión a internet');

      if (!conexionOk) {
        this.error = 'Debes activar el GPS y tener conexión a internet para continuar.';
        return;
      }

      this.conexionLista = true;
      this.apiFallo = false;
      this.pendientesLocales = [];

      const reportesApi = await this.reporteService.getMisReportes();
      this.reportes = reportesApi.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
    } catch (err) {
      console.warn('Fallo al cargar historial desde API:', err);
      this.apiFallo = true;
      this.error = 'No se pudo cargar tu historial. Verifica tu conexión.';
      this.mostrarMensaje('No se pudo cargar tu historial. Verifica tu conexión.', 'warning');

      // Cargar reportes pendientes locales si hay
      const locales = await this.reporteService.getReportesLocales();
      this.pendientesLocales = locales.filter(r => !r.enviado);
    } finally {
      this.cargando = false;
    }
  }

  reintentarVerificacion() {
    this.ngOnInit(); // Reinicia todo el flujo
  }

  // Filtro por categoría
  get reportesFiltrados(): Reporte[] {
    if (!this.filtroCategoria) return this.reportes;
    return this.reportes.filter(r => r.categoria === this.filtroCategoria);
  }

  // Eliminar reportes del backend 
  async eliminarReporte(reporte: Reporte) {
    const alert = await this.alertController.create({
      header: 'Eliminar reporte',
      message: '¿Estás seguro de que deseas eliminar este reporte?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.reporteService.eliminarReporteBackend(reporte.id!);
              this.cargarReportes();
            } catch (err) {
              console.warn('Error al eliminar reporte del backend:', err);
            }
          }
        }
      ]
    });
    await alert.present();
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
