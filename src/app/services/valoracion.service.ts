import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private apiUrl = `${environment.backendUrl}/api/valoraciones`;

  constructor(private http: HttpClient) { }

  async valorarReporte(id: number, utilidad: 'util' | 'no_util') {
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    return this.http.post(`${this.apiUrl}/${id}`, { utilidad }, { headers });
  }


  async obtenerValoracionUsuario(id: number) {
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    return this.http.get<{ valorado: boolean, util?: boolean }>(`${this.apiUrl}/usuario/${id}`, { headers });
  }

}
