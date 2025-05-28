import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onLogin() {
    if (this.email === 'test' && this.password === '1') {
      this.error = '';
      this.router.navigate(['/reporte']);
    } else {
      this.error = 'Correo o contraseña incorrectos.';
      console.log('Correo o contraseña incorrectos.')
    }
  }
}
