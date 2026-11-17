import { TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { RankingItem } from '../../models/publicacion';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { TruncarPipe } from '../../pipes/truncar-pipe';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

@Component({
  selector: 'app-ranking',
  imports: [
    FormsModule,
    TitleCasePipe,
    TiempoRelativoPipe,
    TruncarPipe,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './ranking.html',
  styleUrl: './ranking.scss',
})
export class Ranking implements OnInit {
  private api = inject(PublicacionesApi);
  private dialog = inject(MatDialog);

  periodo = signal<'semana' | 'mes' | 'total'>('semana');
  items = signal<RankingItem[]>([]);
  cargando = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.ranking(this.periodo(), 10).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        const msg =
          e.status === 0
            ? 'No pudimos comunicarnos con el servidor. Por favor, comprobá tu conexión a internet e intentá nuevamente.'
            : (e.error?.message ?? 'Ocurrió un error al cargar el ranking de impacto.');
        this.dialog.open(ModalMensaje, {
          data: { titulo: 'Error al cargar ranking', mensaje: msg },
        });
      },
    });
  }

  cambiarPeriodo(nuevoPeriodo: 'semana' | 'mes' | 'total') {
    if (!nuevoPeriodo || nuevoPeriodo === this.periodo()) return;
    this.periodo.set(nuevoPeriodo);
    this.cargar();
  }
}
