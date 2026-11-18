import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoEstadistica } from '../grafico-estadistica/grafico-estadistica';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, GraficoEstadistica],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.scss',
})
export class Estadisticas {}
