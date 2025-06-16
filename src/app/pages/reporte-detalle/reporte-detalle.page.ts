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
  valoracionActual: boolean | null = null; // true = útil, false = no útil, null = sin valorar

  constructor(
    private route: ActivatedRoute,
    private reporteService: ReporteService,
    private valoracionService: ValoracionService
  ) { }

  async ngOnInit() {
    try {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam || isNaN(Number(idParam))) {
        this.error = 'ID de reporte no válido.';
        return;
      }

      const id = Number(idParam);
      const reporte = await this.reporteService.getReportePorId(id);

      if (!reporte) {
        this.error = 'Reporte no encontrado.';
        return;
      }

      this.reporte = reporte;

      const resp = await (await this.valoracionService.obtenerValoracionUsuario(id)).toPromise();
      if (resp && resp.valorado) {
        this.valoracionActual = resp.util === true;
      } else {
        this.valoracionActual = null;
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

    const utilidad: 'util' | 'no_util' = util ? 'util' : 'no_util';

    try {
      (await this.valoracionService.valorarReporte(this.reporte.id, utilidad)).subscribe({
        next: () => console.log('Valoración enviada'),
        error: (err) => console.error('Error al valorar', err)
      });
    } catch (error) {
      console.error('Error al ejecutar la valoración:', error);
    }
  }

}
