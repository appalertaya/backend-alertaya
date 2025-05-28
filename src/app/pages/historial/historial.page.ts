import { Component, OnInit } from '@angular/core';
import { ReporteService, Reporte } from 'src/app/services/reporte.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {

  reportes: Reporte[] = [];
  mostrarLocales: boolean = true; // Cambiar entre local y backend
  filtroCategoria: string = '';

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
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarReportes();
  }

  // Cargar según origen
  async cargarReportes() {
    if (this.mostrarLocales) {
      this.reportes = (await this.reporteService.getReportesLocales()).reverse();
    } else {
      this.reporteService.getReportesDesdeBackend({}).subscribe(data => {
        this.reportes = [...data].reverse();
      });
    }
  }

  // Cambiar origen (local o backend)
  async toggleOrigen() {
    this.mostrarLocales = !this.mostrarLocales;
    await this.cargarReportes();
  }

  // Filtro por categoría
  get reportesFiltrados(): Reporte[] {
    if (!this.filtroCategoria) return this.reportes;
    return this.reportes.filter(r => r.categoria === this.filtroCategoria);
  }

  // Solo aplica a reportes locales
  async eliminarReporte(reporte: Reporte) {
    const alert = await this.alertController.create({
      header: 'Eliminar reporte',
      message: '¿Estás seguro de que deseas eliminar este reporte?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.reporteService.eliminarReportePorFecha(reporte.fechaHora);
            this.reportes = await this.reporteService.getReportesLocales();
            this.reportes.reverse();
          }
        }
      ]
    });
    await alert.present();
  }
}
