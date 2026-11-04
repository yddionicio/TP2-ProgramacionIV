import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auth`;

  registro(datos: FormData) {
    return this.http.post(`${this.api}/registro`, datos);
  }

  login(body: { identificador: string; password: string }) {
    return this.http.post(`${this.api}/login`, body);
  }
}