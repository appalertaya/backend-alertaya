import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private apiUrl = `${environment.backendUrl}/api/valoraciones`;

  constructor(private http: HttpClient) {}

  async valorarReporte(idReporte: number, util: boolean) {
    const { value: token } = await Preferences.get({ key: 'token' });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}`, {
      idReporte,
      util
    }, { headers });
  }
}
