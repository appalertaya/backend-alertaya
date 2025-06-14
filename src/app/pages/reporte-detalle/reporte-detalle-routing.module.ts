import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteDetallePage } from './reporte-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: ReporteDetallePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporteDetallePageRoutingModule {}
