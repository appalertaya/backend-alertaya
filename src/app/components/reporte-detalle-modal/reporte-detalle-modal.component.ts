import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Reporte } from 'src/app/services/reporte.service';
import { ValoracionService, ValoracionUsuarioResponse } from 'src/app/services/valoracion.service';

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
  ) {}

  async ngOnInit() {
    if (!this.reporte?.id) return;

    try {
      const response = await (
        await this.valoracionService.obtenerValoracionUsuario(this.reporte.id)
      ).toPromise();

      this.valoracion = response?.valorado ? response.util : null;
    } catch (err) {
      console.warn('Error al obtener valoración previa:', err);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async valorar(utilidad: 'util' | 'no_util') {
    if (!this.reporte?.id) return;

    try {
      if (this.valoracion === utilidad) {
        // Si ya estaba valorado con la misma opción, quitar valoración
        await (
          await this.valoracionService.eliminarValoracion(this.reporte.id)
        ).toPromise();
        this.valoracion = null;
      } else {
        // Registrar o cambiar valoración
        await (
          await this.valoracionService.valorarReporte(this.reporte.id, utilidad)
        ).toPromise();
        this.valoracion = utilidad;
      }
    } catch (err) {
      console.error('Error al valorar:', err);
    }
  }

  async quitarValoracion() {
    if (!this.reporte?.id) return;
    try {
      await (
        await this.valoracionService.eliminarValoracion(this.reporte.id)
      ).toPromise();
      this.valoracion = null;
    } catch (err) {
      console.error('Error al quitar valoración:', err);
    }
  }
}
