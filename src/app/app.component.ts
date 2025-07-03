import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConfigService } from './services/config.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private menu: MenuController,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    private pushService: PushNotificationService
  ) { }

  async ngOnInit() {
    await this.configService.loadConfig();
    environment.backendUrl = this.configService.backendUrl;
    console.log('URL final del backend:', environment.backendUrl);
    this.pushService.initPush(); // Inicializar notificaciones
  }

  cerrarMenu() {
    this.menu.close();
  }

  async logout() {
    await this.authService.cerrarSesion();
    await this.menu.close();
    this.router.navigate(['/login']);
  }

}
