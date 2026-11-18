import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { ModalMensaje } from '../shared/modal-mensaje/modal-mensaje';

@Injectable({ providedIn: 'root' })
export class Sesion implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  readonly usuario = signal<Usuario | null>(null);
  readonly esAdmin = computed(() => this.usuario()?.perfil === 'administrador');

  private timerSub: Subscription | null = null;
  private modalAvisoAbierto = false;

  establecer(u: Usuario | null) {
    this.usuario.set(u);
  }

  autorizar(): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/autorizar`, {}).pipe(
      tap((u) => {
        this.usuario.set(u);
        if (u.sesionExpiraEn !== undefined) {
          this.iniciarTemporizador(u.sesionExpiraEn);
        } else {
          this.iniciarTemporizador();
        }
      }),
    );
  }

  refrescar(): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.apiUrl}/auth/refrescar`, {}).pipe(
      tap((u) => {
        this.usuario.set(u);
        this.iniciarTemporizador();
      }),
    );
  }

  iniciarTemporizador(segundosRestantes?: number) {
    this.detenerTemporizador();

    let ms: number;
    if (segundosRestantes !== undefined) {
      // Después de autorizar: avisa cuando falten 30 segundos para vencer.
      // Si faltan menos de 30 segundos, avisa de inmediato.
      const faltaSeg = segundosRestantes - 30;
      ms = faltaSeg <= 0 ? 0 : faltaSeg * 1000;
    } else {
      // Tras login, registro o refrescar: avisa a los sesionAvisoMs milisegundos.
      ms = environment.sesionAvisoMs;
    }

    this.timerSub = timer(ms).subscribe(() => {
      this.mostrarModalExpiracion();
    });
  }

  detenerTemporizador() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = null;
    }
  }

  limpiar() {
    this.usuario.set(null);
    this.detenerTemporizador();
  }

  cerrar() {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.limpiar();
      }),
    );
  }

  // Compatibilidad hacia atrás
  cargar(): Observable<Usuario> {
    return this.autorizar();
  }

  private mostrarModalExpiracion() {
    if (this.modalAvisoAbierto || !this.usuario()) return;
    this.modalAvisoAbierto = true;

    const ref = this.dialog.open(ModalMensaje, {
      data: {
        titulo: 'Aviso de sesión',
        mensaje: 'Tu sesión vence en 30 segundos. ¿Querés extenderla?',
        confirmar: true,
        textoAceptar: 'Extender sesión',
        textoCancelar: 'Salir',
      },
      disableClose: true,
    });

    ref.afterClosed().subscribe((extender) => {
      this.modalAvisoAbierto = false;
      if (extender) {
        this.refrescar().subscribe({
          error: () => {
            this.limpiar();
            this.router.navigate(['/login']);
          },
        });
      } else {
        this.cerrar().subscribe({
          next: () => this.router.navigate(['/login']),
          error: () => this.router.navigate(['/login']),
        });
      }
    });
  }

  ngOnDestroy() {
    this.detenerTemporizador();
  }
}
