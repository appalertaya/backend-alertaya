import { CUSTOM_ELEMENTS_SCHEMA, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportePageRoutingModule } from './reporte-routing.module';

import { ReportePage } from './reporte.page';

import { SafeUrlPipe } from 'src/app/safe-url.pipe';

import { ImagenPreviewPipe } from 'src/app/pipes/imagen-preview.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportePageRoutingModule,
    ImagenPreviewPipe
  ],
  declarations: [ReportePage, SafeUrlPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportePageModule { }
