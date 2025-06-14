import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReporteDetallePageRoutingModule } from './reporte-detalle-routing.module';
import { ReporteDetallePage } from './reporte-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteDetallePageRoutingModule
  ],
  declarations: [ReporteDetallePage]
})
export class ReporteDetallePageModule {}
