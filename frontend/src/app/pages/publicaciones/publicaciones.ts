import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { CrearPublicacion } from '../../components/crear-publicacion/crear-publicacion';
import { Publicacion } from '../../models/publicacion';
import { FiltrarPublicacionesPipe } from '../../pipes/filtrar-publicaciones-pipe';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { Sesion } from '../../services/sesion';
import { ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

@Component({
  selector: 'app-publicaciones',
  imports: [
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    PublicacionCard,
    FiltrarPublicacionesPipe,
  ],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
})
export class Publicaciones implements OnInit {
  private api = inject(PublicacionesApi);
  private sesion = inject(Sesion);
  private dialog = inject(MatDialog);

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  orden = signal<'fecha' | 'likes'>('fecha');
  busqueda = signal('');
  cargando = signal(false);
  pageIndex = 0;
  pageSize = 12;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.listar({ orden: this.orden(), offset: this.pageIndex * this.pageSize, limit: this.pageSize }).subscribe({
      next: (r) => {
        this.publicaciones.set(r.items);
        this.total.set(r.total);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        const msg = e.status === 0
          ? 'No se pudo conectar con el servidor. Comprobá que el backend esté funcionando.'
          : (e.error?.message ?? 'Ocurrió un error al cargar las publicaciones.');
        this.aviso('Error al cargar publicaciones', msg);
      },
    });
  }

  cambiarOrden(valor: 'fecha' | 'likes') {
    this.orden.set(valor);
    this.pageIndex = 0;
    this.cargar();
  }

  cambiarPagina(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.cargar();
  }

  alternarMeGusta(p: Publicacion) {
    const peticion = p.meGusta ? this.api.quitarMeGusta(p._id) : this.api.darMeGusta(p._id);
    peticion.subscribe({
      next: (r) => {
        this.publicaciones.update((l) =>
          l.map((x) => (x._id === p._id ? { ...x, likesCount: r.likesCount, meGusta: r.meGusta } : x)));
      },
      error: (e) => {
        const msg = e.status === 401
          ? 'Debés haber iniciado sesión para interactuar con las publicaciones.'
          : (e.error?.message ?? 'No se pudo registrar tu reacción en este momento. Intentá nuevamente.');
        this.aviso('Reacción no registrada', msg);
      },
    });
  }

  puedeEliminar(p: Publicacion) {
    return this.sesion.usuario()?._id === p.autor._id;
  }

  eliminar(p: Publicacion) {
    this.dialog.open(ModalMensaje, {
      data: {
        titulo: 'Eliminar publicación',
        mensaje: `¿Estás seguro de que querés eliminar "${p.titulo}"? Esta acción no se puede deshacer.`,
        confirmar: true,
      },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.eliminar(p._id).subscribe({
        next: () => {
          this.cargar();
          this.dialog.open(ModalMensaje, {
            data: {
              titulo: 'Publicación eliminada',
              mensaje: 'La publicación fue eliminada correctamente.',
            },
          });
        },
        error: (e) => {
          const msg = e.status === 403
            ? 'No tenés permisos para eliminar esta publicación.'
            : (e.error?.message ?? 'Ocurrió un error al intentar eliminar la publicación.');
          this.aviso('No se pudo eliminar', msg);
        },
      });
    });
  }

  nueva() {
    this.dialog.open(CrearPublicacion).afterClosed().subscribe((creada) => {
      if (creada) {
        this.pageIndex = 0;
        this.cargar();
        this.dialog.open(ModalMensaje, {
          data: {
            titulo: '¡Publicación creada!',
            mensaje: 'Tu publicación ha sido compartida exitosamente.',
          },
        });
      }
    });
  }

  private aviso(titulo: string, mensaje?: string) {
    this.dialog.open(ModalMensaje, { data: { titulo, mensaje: mensaje ?? 'Ocurrió un error inesperado.' } });
  }
}
