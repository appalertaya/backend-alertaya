import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable()
export class TokenExpiradoInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastController: ToastController) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token expirado o no autorizado
        if (error.status === 401 || error.status === 403) {
          // console.warn('Token expirado o inválido. Redirigiendo al login...');
          this.mostrarMensaje('Sesión expirada, inicie nuevamente','warning')
          this.router.navigate(['/login']); // Ruta importante del login
        }

        // Re-lanzar el error para no interrumpir la cadena
        return throwError(() => error);
      })
    );
  }
  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: color,
      duration: 3000
    });
    toast.present();
  }
}
