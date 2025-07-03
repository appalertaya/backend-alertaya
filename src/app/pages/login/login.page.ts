import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  ionViewWillEnter() { // para limpiar los campos al entrar en esta pagina 
    this.email = '';
    this.password = '';
    this.error = '';
  }

  async onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: async (res) => {
        await Promise.all([
          this.authService.guardarToken(res.token),
          Preferences.set({ key: 'email', value: this.email })
        ]);
        this.error = '';
        this.router.navigate(['/reporte']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Correo o contraseña incorrectos.';
        console.warn('Login fallido:', err);
      }
    });
    const { value } = await Preferences.get({ key: 'email' });

  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

}
