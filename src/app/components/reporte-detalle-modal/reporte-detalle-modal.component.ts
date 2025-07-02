import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Reporte } from 'src/app/services/reporte.service';
import { ValoracionService, ValoracionUsuarioResponse } from 'src/app/services/valoracion.service';
import { ReporteService } from 'src/app/services/reporte.service';

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
  estadoConfiabilidad: 'confiable' | 'no_confiable' | null = null;
  cargando: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private valoracionService: ValoracionService,
    private reporteService: ReporteService
  ) { }

  async ngOnInit() {

    this.cargando = true;
    
    try {
      if (!this.reporte?.id) return;

      // Obtener el detalle completo desde el backend
      const detalle = await this.reporteService.getReportePorId(this.reporte.id);
      if (!detalle) return;

      this.reporte = detalle;

      // Fecha formateada
      if (this.reporte?.fechaHora) {
        const fecha = new Date(this.reporte.fechaHora);
        this.fechaFormateada = fecha.toISOString().split('T')[0];
      }

      // Coordenadas numéricas
      if (this.reporte?.lat) this.reporte.lat = Number(this.reporte.lat);
      if (this.reporte?.lng) this.reporte.lng = Number(this.reporte.lng);

      // Imágenes asociadas
      this.imagenes = Array.isArray((detalle as any).imagenes) ? (detalle as any).imagenes : [];

      // Estado de confiabilidad directo desde el backend
      if (detalle.esConfiable === 1) {
        this.estadoConfiabilidad = 'confiable';
      } else if (
        (detalle as any).valoraciones_no_utiles >= 1 &&
        (detalle as any).valoraciones_no_utiles >= (detalle as any).valoraciones_utiles
      ) {
        this.estadoConfiabilidad = 'no_confiable';
      } else {
        this.estadoConfiabilidad = null;
      }

      // Obtener la valoración del usuario (si existe)
      try {
        const response = await (
          await this.valoracionService.obtenerValoracionUsuario(this.reporte.id!)
        ).toPromise();

        this.valoracion = response?.valorado ? response.util : null;
      } catch (err) {
        console.warn('Error al obtener valoración previa:', err);
      }
    } catch (e) {
      console.warn('Error cargando detalle del reporte');
    } finally {
      this.cargando = false;
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
