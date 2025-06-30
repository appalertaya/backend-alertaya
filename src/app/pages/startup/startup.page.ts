import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonicModule } from '@ionic/angular'; 

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [IonicModule], 
  template: '<ion-spinner class="ion-margin-top" name="crescent"></ion-spinner>'
})
export class StartupPage implements OnInit {

  constructor(private router: Router) {}

  async ngOnInit() {
    const { value: token } = await Preferences.get({ key: 'token' });
    if (token) {
      this.router.navigate(['/reporte']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
