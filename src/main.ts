import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { ConfigService } from './app/services/config.service';

if (environment.production) enableProdMode();

const configService = new ConfigService();
configService.loadConfig().then(() => {
  // Usamos una variable global para guardar la URL
  (window as any).backendUrl = configService.backendUrl;

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
