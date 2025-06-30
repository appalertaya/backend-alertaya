import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoCategoriasModalComponent } from './grafico-categorias-modal.component';
import { IonicModule } from '@ionic/angular';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [GraficoCategoriasModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule
  ],
})
export class GraficoCategoriasModalModule {}
