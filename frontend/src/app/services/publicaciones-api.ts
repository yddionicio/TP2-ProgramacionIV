import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginaPublicaciones, Publicacion } from '../models/publicacion';

interface RespuestaLike { likesCount: number; meGusta: boolean; }

@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/publicaciones`;

  listar(p: { orden: 'fecha' | 'likes'; offset: number; limit: number; usuario?: string }) {
    let params = new HttpParams().set('orden', p.orden).set('offset', p.offset).set('limit', p.limit);
    if (p.usuario) params = params.set('usuario', p.usuario);
    return this.http.get<PaginaPublicaciones>(this.api, { params });
  }
  crear(datos: FormData) { return this.http.post<Publicacion>(this.api, datos); }
  eliminar(id: string) { return this.http.delete(`${this.api}/${id}`); }
  darMeGusta(id: string) { return this.http.post<RespuestaLike>(`${this.api}/${id}/like`, {}); }
  quitarMeGusta(id: string) { return this.http.delete<RespuestaLike>(`${this.api}/${id}/like`); }
}