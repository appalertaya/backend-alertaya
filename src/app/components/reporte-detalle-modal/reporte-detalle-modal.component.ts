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
  valoracion: boolean | null = null;
  valoracionActual: boolean | null = null;

  constructor(private modalCtrl: ModalController, private valoracionService: ValoracionService) { }

  async ngOnInit() {
    console.log('Reporte recibido en el modal:', this.reporte);
    if (this.reporte?.id) {
      try {
        const response = await (await this.valoracionService.obtenerValoracionUsuario(this.reporte.id)).toPromise();
        if (response!.valorado) {
          this.valoracion = response!.util ?? null;
        }
      } catch (err) {
        console.warn('Error al obtener valoración previa:', err);
      }
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async valorar(util: boolean) {
    if (!this.reporte?.id) return;

    try {
      const utilidad: 'util' | 'no_util' = util ? 'util' : 'no_util';

      const resp = await (await this.valoracionService
        .valorarReporte(this.reporte.id, utilidad))
        .toPromise();

      this.valoracion = this.valoracion === util ? null : util; // desmarcar o alternar
    } catch (err) {
      console.error('Error al valorar:', err);
    }
  }



}
