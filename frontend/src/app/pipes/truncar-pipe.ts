import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(texto: string, limite = 100, sufijo = '…'): string {
    return texto.length > limite ? texto.slice(0, limite).trimEnd() + sufijo : texto;
  }
}