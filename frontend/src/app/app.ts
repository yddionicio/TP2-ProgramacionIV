import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Sesion } from './services/sesion';
import { ModalMensaje } from './shared/modal-mensaje/modal-mensaje';
import { SoloAdminDirective } from './directives/solo-admin.directive';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    SoloAdminDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  sesion = inject(Sesion);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  salir() {
    this.dialog.open(ModalMensaje, {
      data: {
        titulo: 'Cerrar sesión',
        mensaje: '¿Estás seguro de que querés salir de tu cuenta?',
        confirmar: true,
      },
    }).afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.sesion.cerrar().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => this.router.navigate(['/login']),
      });
    });
  }
}
