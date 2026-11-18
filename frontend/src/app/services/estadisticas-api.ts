import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface RespuestaEstadistica {
  desde: string;
  hasta: string;
  total: number;
  etiquetas: string[];
  valores: number[];
}

@Injectable({ providedIn: 'root' })
export class EstadisticasApi {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/estadisticas`;

  obtener(endpoint: string, desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<RespuestaEstadistica>(`${this.api}/${endpoint}`, { params });
  }
}
