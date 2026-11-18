import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { TruncarPipe } from '../../pipes/truncar-pipe';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { Sesion } from '../../services/sesion';
import { ImagenFallbackDirective } from '../../directives/imagen-fallback.directive';
import { ResaltarDirective } from '../../directives/resaltar.directive';

export interface PublicacionConComentarios extends Publicacion {
  ultimosComentarios?: Comentario[];
}

@Component({
  selector: 'app-mi-perfil',
  imports: [
    RouterLink,
    MatCardModule,
    DatePipe,
    TiempoRelativoPipe,
    TruncarPipe,
    ImagenFallbackDirective,
    ResaltarDirective,
  ],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  sesion = inject(Sesion);
  private api = inject(PublicacionesApi);

  ultimas = signal<PublicacionConComentarios[]>([]);
  cargando = signal(true);

  ngOnInit() {
    const u = this.sesion.usuario();
    if (!u) {
      this.cargando.set(false);
      return;
    }
    this.api.listar({ orden: 'fecha', usuario: u._id, offset: 0, limit: 3 }).subscribe({
      next: (r) => {
        if (r.items.length === 0) {
          this.ultimas.set([]);
          this.cargando.set(false);
          return;
        }

        // Para cada una de las 3 publicaciones, cargar sus últimos 3 comentarios
        const peticiones = r.items.map((p) =>
          this.api.listarComentarios(p._id, 0, 3).pipe(
            catchError(() => of({ items: [], total: 0, offset: 0, limit: 3 })),
          ),
        );

        forkJoin(peticiones).subscribe((respuestas) => {
          const pubsConComentarios: PublicacionConComentarios[] = r.items.map((p, idx) => ({
            ...p,
            comentariosCount: p.comentariosCount ?? respuestas[idx].total,
            ultimosComentarios: respuestas[idx].items,
          }));
          this.ultimas.set(pubsConComentarios);
          this.cargando.set(false);
        });
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }
}
