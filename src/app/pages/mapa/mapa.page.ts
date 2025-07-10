import { AfterViewInit, Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { GeolocationService } from 'src/app/services/geolocalizacion.service';
import { PermisosGPSInternetService } from 'src/app/services/permisos.service';
import { ReporteService } from 'src/app/services/reporte.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReporteDetalleModalComponent } from 'src/app/components/reporte-detalle-modal/reporte-detalle-modal.component';
import { CategoriasTablaModalComponent } from 'src/app/components/categorias-tabla-modal/categorias-tabla-modal.component';

interface Reporte {
  lat: number;
  lng: number;
  categoria: string;
  descripcion: string;
}


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false
})

export class MapaPage implements AfterViewInit {
  newMap?: GoogleMap;
  cargandoMapa: boolean = true;
  // categorias
  categoriasSeleccionadas: string[] = [];
  todasCategorias: string[] = [
    'Corte de luz',
    'Corte de agua',
    'Semáforo en mal estado',
    'Paradero dañado',
    'Alumbrado público',
    'Fuga o filtración',
    'Calzada o vereda rota',
    'Otros'
  ];
  radioKmSeleccionado: number = 2;
  private marcadores: string[] = [];

  constructor(
    private geoService: GeolocationService,
    private permisosService: PermisosGPSInternetService,
    private reporteService: ReporteService,
    private modalController: ModalController
  ) { }

  async ngAfterViewInit() {
    const permisosOk = await this.permisosService.verificarGPSyPermisos();
    if (!permisosOk) {
      console.warn('Por favor revise los permisos del GPS');
      return;
    }

    const ubicacion = await this.geoService.getCurrentPosition();
    if (!ubicacion) {
      console.warn('No se pudo obtener la ubicación');
      return;
    }


    // Espera a que el DOM esté listo
    setTimeout(async () => {

      // Espera explícita de visibilidad y tamaño del div
      await new Promise(resolve => setTimeout(resolve, 500));
      const mapRef = document.getElementById('map');

      if (!mapRef || mapRef.offsetHeight === 0) {
        console.warn('Mapa aún no visible en pantalla, espera mayor.');
        return;
      }

      // Crear el mapa
      this.newMap = await GoogleMap.create({
        id: 'my-map',
        element: mapRef,
        apiKey: 'AIzaSyCLwen821H_u_cWDcKQvamibkaiEiTUySs',
        config: {
          center: {
            lat: ubicacion.lat,
            lng: ubicacion.lon
          },
          zoom: 15,
          // zoomGesturesEnabled: true,
        }
      });

      this.cargarReportes(); // cargar reportes

      // Forzamos redimensionamiento del mapa
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);

      this.cargandoMapa = false;

      console.log('Mapa creado en:', ubicacion.lat, ubicacion.lon);

    }, 500); // Pequeña espera para asegurar que el div esté listo
  }

  ionViewWillLeave() {
    if (this.newMap) {
      this.newMap.destroy();
      this.newMap = undefined;
    }
  }

  async cargarReportes() {
    const params: any = {};

    const ubicacion = await this.geoService.getCurrentPosition();
    if (!ubicacion) {
      console.warn('No se pudo obtener la ubicación');
      return;
    }

    await this.newMap?.addMarker({ // añadir mi ubicacion con logo 
      coordinate: { lat: ubicacion.lat, lng: ubicacion.lon },
      title: 'Mi ubicación',
      iconUrl: 'assets/iconos/logoYo.png',
      iconSize: { width: 36, height: 36 }
    });


    params.lat = ubicacion.lat;
    params.lng = ubicacion.lon;
    params.radio = this.radioKmSeleccionado;

    if (this.categoriasSeleccionadas.length === 1) {
      params.categoria = this.categoriasSeleccionadas[0];
    }

    try {
      const reportes = await this.reporteService.getReportesDesdeBackend(params).toPromise();

      if (Array.isArray(reportes)) {
        await this.mostrarMarcadores(reportes);
      } else {
        console.warn('No se recibieron reportes válidos:', reportes);
      }

    } catch (err) {
      console.error('Error al cargar reportes:', err);
    }
  }

  distanciaEnKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  reiniciarFiltros() {
    this.categoriasSeleccionadas = [];
    this.radioKmSeleccionado = 2;
    this.cargarReportes();
  }

  private marcadorReporteMap = new Map<string, number>(); // marcadorId -> reporteId

  async abrirModalDetalle(reporte: Reporte) {
    const modal = await this.modalController.create({
      component: ReporteDetalleModalComponent,
      componentProps: { reporte }
    });
    await modal.present();
  }

  async mostrarMarcadores(reportes: any[]) {
    // Eliminar marcadores anteriores
    for (const id of this.marcadores) {
      await this.newMap?.removeMarker(id);
    }
    this.marcadores = [];
    this.marcadorReporteMap.clear();

    // Agregar marcador de tu ubicación
    const ubicacion = await this.geoService.getCurrentPosition();
    if (ubicacion) {
      const marcadorId = await this.newMap?.addMarker({
        coordinate: { lat: ubicacion.lat, lng: ubicacion.lon },
        title: 'Mi ubicación',
        iconUrl: 'assets/iconos/logoYo.png',
        iconSize: { width: 36, height: 36 },
        zIndex: 1 // marcador abajo
      });
      if (marcadorId) this.marcadores.push(marcadorId);
    }

    // Agregar marcadores de reportes
    for (const rep of reportes) {
      try {
        let confiabilidad: 'confiable' | 'no_confiable' | undefined = undefined;

        if (rep.esConfiable === 1) {
          confiabilidad = 'confiable';
        } else if (rep.esConfiable === 0 && rep.valoraciones_utiles + rep.valoraciones_no_utiles > 0) {
          // Solo mostrar "no confiable" si tiene valoraciones
          confiabilidad = 'no_confiable';
        }


        const iconUrl = this.getIconoPorCategoria(rep.categoria, confiabilidad);

        const markerId = await this.newMap?.addMarker({
          coordinate: {
            lat: parseFloat(rep.lat),
            lng: parseFloat(rep.lng),
          },
          iconUrl,
          iconSize: { width: 32, height: 32 },
          zIndex: 2
        });

        if (markerId) {
          this.marcadores.push(markerId);
          this.marcadorReporteMap.set(markerId, rep);
        }
      } catch (err) {
        console.warn('Error al agregar marcador:', err);
      }
    }


    // Registrar listener para clics en marcadores
    this.newMap?.setOnMarkerClickListener(async (data) => {
      const reporte = this.marcadorReporteMap.get(data.markerId);
      if (reporte) {
        const modal = await this.modalController.create({
          component: ReporteDetalleModalComponent,
          componentProps: { reporte },
          cssClass: 'reporte-detalle-modal',
          backdropDismiss: true,
          showBackdrop: true
        });
        await modal.present();
      }
    });
  }

  getIconoPorCategoria(categoria: string, confiabilidad?: 'confiable' | 'no_confiable'): string {
    let base = '';

    switch (categoria.toLowerCase()) {
      case 'corte de luz': base = 'logoLuz'; break;
      case 'corte de agua': base = 'logoAgua'; break;
      case 'semáforo en mal estado': base = 'logoSemaforo'; break;
      case 'paradero dañado': base = 'logoParadero'; break;
      case 'alumbrado público': base = 'logoAlumbrado'; break;
      case 'fuga o filtración': base = 'logoFuga'; break;
      case 'calzada o vereda rota': base = 'logoCalzada'; break;
      default: base = 'logoOtro';
    }

    if (confiabilidad === 'confiable') return `assets/iconos/${base}Confiable.png`;
    if (confiabilidad === 'no_confiable') return `assets/iconos/${base}NoConfiable.png`;
    return `assets/iconos/${base}.png`;
  }


  async abrirModalGraficoCategorias() {
    const modal = await this.modalController.create({
      component: CategoriasTablaModalComponent,
      cssClass: 'grafico-categorias-modal'
    });
    await modal.present();
  }

}
