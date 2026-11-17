import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, timer } from 'rxjs';
import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-cargando',
  imports: [MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss',
})
export class Cargando implements OnInit, OnDestroy {
  private sesion = inject(Sesion);
  private router = inject(Router);

  cargando = signal(true);
  error = signal('');
  demorando = signal(false);

  private demoraSub: Subscription | null = null;

  ngOnInit() {
    this.verificar();
  }

  verificar() {
    this.cargando.set(true);
    this.error.set('');
    this.demorando.set(false);

    // Si tarda más de 4 segundos, mostramos el aviso de servidor despertando
    this.demoraSub?.unsubscribe();
    this.demoraSub = timer(4000).subscribe(() => {
      if (this.cargando()) {
        this.demorando.set(true);
      }
    });

    this.sesion.autorizar().subscribe({
      next: () => {
        this.limpiarTimer();
        this.router.navigate(['/publicaciones']);
      },
      error: (e) => {
        this.limpiarTimer();
        this.cargando.set(false);
        if (e.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error.set('No pudimos conectar con el servidor');
        }
      },
    });
  }

  private limpiarTimer() {
    if (this.demoraSub) {
      this.demoraSub.unsubscribe();
      this.demoraSub = null;
    }
  }

  ngOnDestroy() {
    this.limpiarTimer();
  }
}
