import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReporteService } from 'src/app/services/reporte.service';

@Component({
  selector: 'categorias-tabla-modal',
  templateUrl: './categorias-tabla-modal.html',
  styleUrls: ['./categorias-tabla-modal.scss'],
  standalone: false
})
export class CategoriasTablaModalComponent {

  datos: { categoria: string; cantidad: number }[] = [];
  cargando = true;

  constructor(
    private modalCtrl: ModalController,
    private reporteService: ReporteService
  ) { }

  ngOnInit() {
    this.reporteService.getCantidadPorCategoria().subscribe({
      next: (res) => {
        this.datos = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cantidades por categoría', err);
        this.cargando = false;
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
