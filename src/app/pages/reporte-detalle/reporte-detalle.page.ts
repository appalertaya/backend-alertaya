import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReporteService, Reporte } from 'src/app/services/reporte.service';
import { ValoracionService } from 'src/app/services/valoracion.service';

@Component({
  selector: 'app-reporte-detalle',
  templateUrl: './reporte-detalle.page.html',
  styleUrls: ['./reporte-detalle.page.scss'],
  standalone: false
})
export class ReporteDetallePage implements OnInit {

  reporte: Reporte | null = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private reporteService: ReporteService,
    private valoracionService: ValoracionService
  ) {}

  async ngOnInit() {
    try {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) {
        this.error = 'ID de reporte no válido.';
        return;
      }

      const id = Number(idParam);
      const reportes = await this.reporteService.getReportesDesdeBackend({}).toPromise();

      if (!reportes) {
        this.error = 'No se pudo obtener los reportes.';
        return;
      }

      this.reporte = reportes.find(r => r.id === id) || null;

      if (!this.reporte) {
        this.error = 'Reporte no encontrado.';
      }

    } catch (err) {
      this.error = 'Error al cargar el reporte.';
      console.error(err);
    } finally {
      this.cargando = false;
    }
  }

  async valorar(util: boolean) {
    if (!this.reporte?.id) return;
    (await this.valoracionService.valorarReporte(this.reporte.id, util)).subscribe({
      next: () => console.log('Valoración enviada'),
      error: (err) => console.error('Error al valorar', err)
    });
  }
}
