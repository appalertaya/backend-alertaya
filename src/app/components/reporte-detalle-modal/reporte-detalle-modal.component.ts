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
  mostrarCoords: boolean = false;
  fechaFormateada: string = '';
  imagenes: string[] = [];

  constructor(
    private modalCtrl: ModalController,
    private valoracionService: ValoracionService
  ) { }

  async ngOnInit() {
    // viene reporte
    if (!this.reporte?.id) return;
    console.log("reporte: ",this.reporte)
    // fecha
    if (this.reporte?.fechaHora) {
      const fecha = new Date(this.reporte.fechaHora);
      this.fechaFormateada = fecha.toISOString().split('T')[0]; // "2025-06-28"
    }

    // latitud y longitud
    if (this.reporte?.lat) this.reporte.lat = Number(this.reporte.lat);
    if (this.reporte?.lng) this.reporte.lng = Number(this.reporte.lng);

    // imagenes
    if (this.reporte && Array.isArray((this.reporte as any).imagenes)) {
      this.imagenes = (this.reporte as any).imagenes;
      console.log("this.imagenes: ",this.imagenes)
    }

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
