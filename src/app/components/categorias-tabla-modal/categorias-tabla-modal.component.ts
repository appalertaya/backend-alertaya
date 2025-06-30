import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReporteService } from 'src/app/services/reporte.service';

@Component({
  selector: 'categorias-tabla-modal',
  templateUrl: './categorias-tabla-modal.component.html',
  styleUrls: ['./categorias-tabla-modal.component.scss'],
  standalone: false
})
export class CategoriasTablaModalComponent {

  datos: { categoria: string; cantidad: number }[] = [];

  constructor(
    private reporteService: ReporteService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit(): void {
    this.reporteService.getCantidadPorCategoria().subscribe({
      next: (res) => {
        this.datos = res;
      },
      error: (err) => {
        console.error('Error al obtener datos de categorías', err);
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
