import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { GoogleMapsModule } from '@angular/google-maps';

import { ReporteDetalleModalComponent } from './components/reporte-detalle-modal/reporte-detalle-modal.component';
import { CategoriasTablaModalComponent } from './components/categorias-tabla-modal/categorias-tabla-modal.component';

import { TokenExpiradoInterceptor } from './interceptors/token-expirado.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    ReporteDetalleModalComponent,
    CategoriasTablaModalComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    GoogleMapsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenExpiradoInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
