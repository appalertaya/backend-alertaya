import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';

export interface ValoracionUsuarioResponse {
  valorado: boolean;
  util: 'util' | 'no_util' | null;
}

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private apiUrl = `https://backend-alertaya.onrender.com/api/valoraciones`;

  constructor(private http: HttpClient) {}

  async valorarReporte(id: number, utilidad: 'util' | 'no_util' | null): Promise<Observable<any>> {
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    return this.http.post(`${this.apiUrl}/${id}`, { utilidad }, { headers });
  }

  async obtenerValoracionUsuario(reporteId: number): Promise<Observable<ValoracionUsuarioResponse>> {
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    return this.http.get<ValoracionUsuarioResponse>(`${this.apiUrl}/usuario/${reporteId}`, { headers });
  }

  async eliminarValoracion(reporteId: number): Promise<Observable<any>> {
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    return this.http.delete(`${this.apiUrl}/${reporteId}`, { headers });
  }
}
