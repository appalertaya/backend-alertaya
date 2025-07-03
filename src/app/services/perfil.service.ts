// src/app/services/perfil.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = 'https://backend-alertaya.onrender.com/api/usuarios/perfil';

  constructor(private http: HttpClient) {}

  getPerfil() {
    return this.http.get<any>(this.apiUrl);
  }

  actualizarPerfil(data: { nombre: string; correo: string }) {
    return this.http.put<any>(this.apiUrl, data);
  }
}
