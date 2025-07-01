import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasTablaModalComponent } from './categorias-tabla-modal.component';
import { IonicModule } from '@ionic/angular';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CategoriasTablaModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule
  ],
})
export class CategoriasTablaModalModule {}
