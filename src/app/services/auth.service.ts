import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.backendUrl}/api/auth`;

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
  }

  async guardarToken(token: string) {
    await Preferences.set({ key: 'token', value: token });
  }

  async obtenerToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'token' });
    return value;
  }

  async cerrarSesion() {
    await Preferences.remove({ key: 'token' });
  }

  registrar(nombre: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { nombre, email, password });
  }

}
