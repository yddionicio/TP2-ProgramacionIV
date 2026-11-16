import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Publicacion } from '../../models/publicacion';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { TruncarPipe } from '../../pipes/truncar-pipe';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-mi-perfil',
  imports: [MatCardModule, DatePipe, TiempoRelativoPipe, TruncarPipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil implements OnInit {
  sesion = inject(Sesion);
  private api = inject(PublicacionesApi);

  ultimas = signal<Publicacion[]>([]);
  cargando = signal(true);

  ngOnInit() {
    const u = this.sesion.usuario();
    if (!u) {
      this.cargando.set(false);
      return;
    }
    this.api.listar({ orden: 'fecha', usuario: u._id, offset: 0, limit: 3 }).subscribe({
      next: (r) => {
        this.ultimas.set(r.items);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }
}
