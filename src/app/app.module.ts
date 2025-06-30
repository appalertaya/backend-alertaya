import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { GoogleMapsModule } from '@angular/google-maps';

import { ReporteDetalleModalComponent } from './components/reporte-detalle-modal/reporte-detalle-modal.component';
import { GraficoCategoriasModalModule } from './components/grafico-categorias-modal/grafico-categorias-modal.module';

@NgModule({
  declarations: [AppComponent, ReporteDetalleModalComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, GoogleMapsModule, GraficoCategoriasModalModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
