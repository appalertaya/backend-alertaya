import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    standalone: false
})
export class RegisterPage {
    nombre: string = '';
    email: string = '';
    password: string = '';
    mensaje: string = '';
    error: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    ionViewWillEnter() { // para limpiar los campos al entrar en esta pagina 
        this.nombre = '';
        this.email = '';
        this.password = '';
        this.mensaje = '';
        this.error = '';
    }

    onRegister() {
        this.authService.registrar(this.nombre, this.email, this.password).subscribe({
            next: (res: any) => {
                this.mensaje = res.mensaje;
                this.error = '';
            },
            error: (err) => {
                this.error = err.error?.error || 'Error al registrar.';
                this.mensaje = '';
            }
        });
    }

    irALogin() {
        this.router.navigate(['/login']);
    }

}
