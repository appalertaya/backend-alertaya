import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(email: string, password: string): boolean {
    const usuarioValido = 'test@luzya.cl';
    const passwordValido = '1234';

    return email === usuarioValido && password === passwordValido;
  }

}
