import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Chart, ChartType, registerables } from 'chart.js';
import { EstadisticasApi } from '../../../services/estadisticas-api';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-estadistica',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './grafico-estadistica.html',
  styleUrl: './grafico-estadistica.scss',
})
export class GraficoEstadistica implements AfterViewInit, OnDestroy {
  private api = inject(EstadisticasApi);

  @Input({ required: true }) titulo = '';
  @Input({ required: true }) tipo: 'bar' | 'line' | 'doughnut' = 'bar';
  @Input({ required: true }) endpoint = '';

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  desde = signal(this.formatoFecha(new Date(Date.now() - 30 * 24 * 3600 * 1000)));
  hasta = signal(this.formatoFecha(new Date()));
  total = signal(0);
  cargando = signal(false);
  sinDatos = signal(false);
  error = signal('');

  private chart: Chart | null = null;

  private formatoFecha(d: Date): string {
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  ngAfterViewInit() {
    this.cargarDatos();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  cargarDatos() {
    this.cargando.set(true);
    this.error.set('');

    this.api.obtener(this.endpoint, this.desde(), this.hasta()).subscribe({
      next: (res) => {
        this.total.set(res.total);
        this.cargando.set(false);
        const hayDatos = res.etiquetas && res.etiquetas.length > 0 && res.total > 0;
        this.sinDatos.set(!hayDatos);
        this.renderizarGrafico(res.etiquetas, res.valores);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(
          err.error?.message || 'Error al obtener las estadísticas para este rango.',
        );
      },
    });
  }

  private renderizarGrafico(etiquetas: string[], valores: number[]) {
    if (!this.canvasRef?.nativeElement) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (this.sinDatos()) return;

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const coloresPaleta = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#84cc16',
      '#14b8a6',
      '#6366f1',
    ];

    const esDoughnut = this.tipo === 'doughnut';
    const bgColores = esDoughnut
      ? coloresPaleta.slice(0, valores.length)
      : this.tipo === 'line'
        ? 'rgba(59, 130, 246, 0.2)'
        : 'rgba(59, 130, 246, 0.7)';

    const borderColores = esDoughnut
      ? '#ffffff'
      : '#3b82f6';

    this.chart = new Chart(ctx, {
      type: this.tipo as ChartType,
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: this.titulo,
            data: valores,
            backgroundColor: bgColores,
            borderColor: borderColores,
            borderWidth: esDoughnut ? 2 : 1.5,
            fill: this.tipo === 'line',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: esDoughnut,
            position: 'bottom',
          },
        },
        scales: esDoughnut
          ? {}
          : {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
      },
    });
  }
}
