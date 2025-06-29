import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private apiUrl = `https://backend-alertaya.onrender.com/api/valoraciones`;

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

  async eliminarValoracion(reporteId: number) {
    console.log("reporteId: ",reporteId)
    const token = await Preferences.get({ key: 'token' });
    const headers = new HttpHeaders({ Authorization: `Bearer ${token.value}` });
    console.log("enlace: ",`${this.apiUrl}/${reporteId}`)
    return this.http.delete(`${this.apiUrl}/${reporteId}`, { headers });
  }

}
