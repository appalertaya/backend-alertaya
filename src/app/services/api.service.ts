import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://backend-alertaya.onrender.com/api';

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create(); // inicializar Storage
  }

  private async getToken(): Promise<string | null> {
    return await this.storage.get('token');
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get(endpoint: string): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => this.http.get(`${this.baseUrl}${endpoint}`, { headers }))
    );
  }

  post(endpoint: string, data: any): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => this.http.post(`${this.baseUrl}${endpoint}`, data, { headers }))
    );
  }

  put(endpoint: string, data: any): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => this.http.put(`${this.baseUrl}${endpoint}`, data, { headers }))
    );
  }

  delete(endpoint: string): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap(headers => this.http.delete(`${this.baseUrl}${endpoint}`, { headers }))
    );
  }
}
