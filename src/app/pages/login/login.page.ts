import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: async (res) => {
        await this.authService.guardarToken(res.token);
        this.error = '';
        this.router.navigate(['/reporte']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Correo o contraseña incorrectos.';
        console.warn('Login fallido:', err);
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }

}
