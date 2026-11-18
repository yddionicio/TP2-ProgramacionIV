import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Publicacion } from '../../models/publicacion';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { TruncarPipe } from '../../pipes/truncar-pipe';
import { ImagenFallbackDirective } from '../../directives/imagen-fallback.directive';
import { ResaltarDirective } from '../../directives/resaltar.directive';

@Component({
  selector: 'app-publicacion-card',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    DatePipe,
    TitleCasePipe,
    TiempoRelativoPipe,
    TruncarPipe,
    ImagenFallbackDirective,
    ResaltarDirective,
  ],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  @Input({ required: true }) publicacion!: Publicacion;
  @Input() puedeEliminar = false;
  @Output() alternarMeGusta = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();
}
