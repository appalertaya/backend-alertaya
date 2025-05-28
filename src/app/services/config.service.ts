import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  backendUrl: string = '';

  async loadConfig(): Promise<void> {
    const { value } = await Preferences.get({ key: 'backend_url' });

    // Si no hay IP guardada, usar IP actual detectada o pedirla manualmente
    if (value) {
      this.backendUrl = value;
    } else {
      this.backendUrl = 'http://192.168.1.10:3000'; // puedes personalizarlo
      await Preferences.set({ key: 'backend_url', value: this.backendUrl });
    }

    console.log('🛠️ Configuración cargada. URL backend:', this.backendUrl);
  }
}
