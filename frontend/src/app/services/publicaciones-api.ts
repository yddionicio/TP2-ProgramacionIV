import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PaginaPublicaciones, Publicacion, RankingRespuesta } from '../models/publicacion';
import { Comentario, PaginaComentarios } from '../models/comentario';

interface RespuestaLike {
  likesCount: number;
  meGusta: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesApi {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/publicaciones`;

  listar(p: {
    orden: 'fecha' | 'likes';
    offset: number;
    limit: number;
    usuario?: string;
    categoria?: string;
  }) {
    let params = new HttpParams()
      .set('orden', p.orden)
      .set('offset', p.offset)
      .set('limit', p.limit);
    if (p.usuario) params = params.set('usuario', p.usuario);
    if (p.categoria) params = params.set('categoria', p.categoria);
    return this.http.get<PaginaPublicaciones>(this.api, { params });
  }

  obtenerPorId(id: string) {
    return this.http.get<Publicacion>(`${this.api}/${id}`);
  }

  ranking(periodo: 'semana' | 'mes' | 'total' = 'semana', limit: number = 10) {
    const params = new HttpParams().set('periodo', periodo).set('limit', limit);
    return this.http.get<RankingRespuesta>(`${this.api}/ranking`, { params });
  }

  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.api, datos);
  }

  eliminar(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<RespuestaLike>(`${this.api}/${id}/like`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<RespuestaLike>(`${this.api}/${id}/like`);
  }

  // Comentarios
  listarComentarios(publicacionId: string, offset = 0, limit = 5) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<PaginaComentarios>(`${this.api}/${publicacionId}/comentarios`, { params });
  }

  crearComentario(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(`${this.api}/${publicacionId}/comentarios`, { mensaje });
  }

  actualizarComentario(publicacionId: string, comentarioId: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.api}/${publicacionId}/comentarios/${comentarioId}`, { mensaje });
  }
}
