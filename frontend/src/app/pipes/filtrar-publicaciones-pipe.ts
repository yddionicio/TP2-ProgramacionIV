import { Pipe, PipeTransform } from '@angular/core';
import { Publicacion } from '../models/publicacion';

@Pipe({ name: 'filtrarPublicaciones' })
export class FiltrarPublicacionesPipe implements PipeTransform {
  transform(lista: Publicacion[], texto: string): Publicacion[] {
    const t = texto.trim().toLowerCase();
    if (!t) return lista;
    return lista.filter(
      (p) => p.titulo.toLowerCase().includes(t) || p.autor.nombreUsuario.toLowerCase().includes(t),
    );
  }
}