import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-grafico-categorias-modal',
  templateUrl: './grafico-categorias-modal.component.html',
  styleUrls: ['./grafico-categorias-modal.component.scss'],
  standalone: false
})
export class GraficoCategoriasModalComponent {

  pieChartType: ChartType = 'pie';

  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  pieChartData = {
    labels: ['Agua', 'Luz', 'Gas'],
    datasets: [
      {
        data: [10, 5, 8],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384']
      }
    ]
  };

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
