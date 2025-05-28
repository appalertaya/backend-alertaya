import { AfterViewInit, Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { GeolocationService } from 'src/app/services/geolocalizacion.service';
import { PermisosGPSInternetService } from 'src/app/services/permisos.service';
import { ReporteService } from 'src/app/services/reporte.service';

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


  constructor(
    private geoService: GeolocationService,
    private permisosService: PermisosGPSInternetService,
    private reporteService: ReporteService
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
          zoom: 15
        }
      });

      this.cargarReportes(); // cargar reportes

      // Forzamos redimensionamiento del mapa
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);

      this.cargandoMapa = false;

      console.log('Mapa creado en:', ubicacion.lat, ubicacion.lon);

      await this.mostrarReportesCercanos(ubicacion.lat, ubicacion.lon);
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
    if (this.categoriasSeleccionadas.length === 1) {
      params.categoria = this.categoriasSeleccionadas[0];
    }

    try {
      const reportes = await this.reporteService.getReportesDesdeBackend(params).toPromise();;

      if (Array.isArray(reportes)) {
        await this.mostrarMarcadores(reportes);
      } else {
        console.warn('No se recibieron reportes válidos:', reportes);
      }

    } catch (err) {
      console.error('Error al cargar reportes:', err);
    }
  }



  async mostrarMarcadores(reportes: any[]) {
    for (const rep of reportes) {
      try {
        await this.newMap?.addMarker({
          coordinate: {
            lat: parseFloat(rep.lat),
            lng: parseFloat(rep.lng),
          },
          title: rep.categoria,
          snippet: rep.descripcion,
          iconUrl: this.getIconoPorCategoria(rep.categoria),
        });
      } catch (err) {
        console.warn('Error al agregar marcador:', err);
      }
    }
  }



  getIconoPorCategoria(categoria: string): string {
    switch (categoria.toLowerCase()) {
      case 'corte de luz':
        return 'assets/iconos/logoLuz.png';
      case 'corte de agua':
        return 'assets/iconos/logoAgua.png';
      case 'semáforo en mal estado':
        return 'assets/iconos/logoSemaforo.png';
      case 'paradero dañado':
        return 'assets/iconos/logoParadero.png';
      case 'alumbrado público':
        return 'assets/iconos/logoAlumbrado.png';
      case 'fuga o filtración':
        return 'assets/iconos/logoFuga.png';
      case 'calzada o vereda rota':
        return 'assets/iconos/logoCalzada.png';
      default:
        return 'assets/iconos/logoOtro.png'; // ícono por defecto
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

  async mostrarReportesCercanos(lat: number, lng: number) {
    const radioKm = 2;

    // 🔁 Reemplaza esto con tus datos reales desde el backend o servicio
    const todosLosReportes: Reporte[] = [
      { lat: lat + 0.01, lng: lng + 0.01, categoria: 'Corte de luz', descripcion: 'Sin luz en la cuadra' },
      { lat: lat + 0.03, lng: lng + 0.01, categoria: 'Fuga de agua', descripcion: 'Agua brotando de vereda' },
      { lat: lat - 0.008, lng: lng - 0.01, categoria: 'Semáforo dañado', descripcion: 'No funciona semáforo' },
    ];

    const cercanos = todosLosReportes.filter(r => {
      const distancia = this.distanciaEnKm(lat, lng, r.lat, r.lng);
      return distancia <= radioKm;
    });

    // Mi ubicacion
    await this.newMap?.addMarker({
      coordinate: { lat, lng },
      title: 'Mi ubicación',
      iconUrl: '/assets/icon/yo.png'
    });

    // Reportes cercanos
    for (const r of cercanos) {
      await this.newMap?.addMarker({
        coordinate: { lat: r.lat, lng: r.lng },
        title: r.categoria,
        snippet: r.descripcion,
        iconUrl: '/assets/icon/alerta.png'
      });
    }
  }

}
