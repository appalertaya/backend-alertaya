import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Reporte } from 'src/app/services/reporte.service';
import { ValoracionService } from 'src/app/services/valoracion.service';

@Component({
  selector: 'app-reporte-detalle-modal',
  templateUrl: './reporte-detalle-modal.component.html',
  styleUrls: ['./reporte-detalle-modal.component.scss'],
  standalone: false
})
export class ReporteDetalleModalComponent {
  @Input() reporte!: Reporte;
  valoracion: 'util' | 'no_util' | null = null;

  constructor(
    private modalCtrl: ModalController,
    private valoracionService: ValoracionService
  ) { }

  async ngOnInit() {
    if (this.reporte?.id) {
      try {
        const response = await (
          await this.valoracionService.obtenerValoracionUsuario(this.reporte.id)
        ).toPromise();
        if (response?.valorado) {
          this.valoracion = response.util === true ? 'util' : 'no_util';
        } else {
          this.valoracion = null;
        }

      } catch (err) {
        console.warn('Error al obtener valoración previa:', err);
      }
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async valorar(utilidad: 'util' | 'no_util') {
    if (!this.reporte?.id) return;
    try {
      if (this.valoracion === utilidad) {
        // Si ya está valorado con la misma opción, eliminarla
        console.log("this.reporte.id: ",this.reporte.id)
        await this.valoracionService.eliminarValoracion(this.reporte.id);
        this.valoracion = null;
      } else {
        // Si es nueva o distinta valoración, registrar o actualizar
        await (
          await this.valoracionService.valorarReporte(this.reporte.id, utilidad)
        ).toPromise();
        this.valoracion = utilidad;
      }
    } catch (err) {
      console.error('Error al valorar:', err);
    }
  }
}
