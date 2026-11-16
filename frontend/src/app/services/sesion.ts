import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class Sesion {
  private http = inject(HttpClient);
  readonly usuario = signal<Usuario | null>(null);
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  establecer(u: Usuario | null) {
    this.usuario.set(u);
  }

  cargar(): Observable<Usuario | null> {
    return this.http.get<Usuario>(`${environment.apiUrl}/users/me`).pipe(
      tap((u) => this.usuario.set(u)),
      catchError(() => {
        this.usuario.set(null);
        return of(null);
      }),
    );
  }

  cerrar() {
    return this.http
      .post(`${environment.apiUrl}/auth/logout`, {})
      .pipe(tap(() => this.usuario.set(null)));
  }
}