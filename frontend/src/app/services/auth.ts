import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auth`;

  registro(datos: FormData) {
    return this.http.post<Usuario>(`${this.api}/registro`, datos);
  }

  login(body: { identificador: string; password: string }) {
    return this.http.post<Usuario>(`${this.api}/login`, body);
  }
}