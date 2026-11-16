import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(valor: string | Date): string {
    const seg = Math.floor((Date.now() - new Date(valor).getTime()) / 1000);
    if (seg < 60) return 'hace un momento';
    const min = Math.floor(seg / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
    return new Date(valor).toLocaleDateString('es-AR');
  }
}