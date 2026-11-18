import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

export interface PaginaUsuarios {
  items: (Usuario & { activo: boolean })[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApi {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/users`;

  listar(offset = 0, limit = 10) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<PaginaUsuarios>(this.api, { params });
  }

  crear(datos: FormData) {
    return this.http.post<Usuario>(this.api, datos);
  }

  deshabilitar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.api}/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<{ mensaje: string }>(`${this.api}/${id}/habilitar`, {});
  }
}
