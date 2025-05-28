import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ReporteService } from './services/reporte.service';
import { ConfigService } from './services/config.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private menu: MenuController, private reporteService: ReporteService, private configService: ConfigService) { }

  async ngOnInit() {
    await this.configService.loadConfig();
    environment.backendUrl = this.configService.backendUrl;
    console.log('🌐 URL final del backend:', environment.backendUrl);
    this.reporteService.sincronizarReportesPendientes();
  }

  async sincronizarPendientes() {
    await this.reporteService.sincronizarReportesPendientes();
  }


  cerrarMenu() {
    this.menu.close();
  }

}
