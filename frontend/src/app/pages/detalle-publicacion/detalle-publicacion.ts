import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Publicacion } from '../../models/publicacion';
import { Comentario } from '../../models/comentario';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo-pipe';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { Sesion } from '../../services/sesion';
import { ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

@Component({
  selector: 'app-detalle-publicacion',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    TitleCasePipe,
    TiempoRelativoPipe,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.scss',
})
export class DetallePublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PublicacionesApi);
  private dialog = inject(MatDialog);
  sesion = inject(Sesion);

  id = '';
  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  noExiste = signal(false);

  // Comentarios
  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  cargandoComentarios = signal(false);
  cargandoMas = signal(false);
  offsetComentarios = 0;
  readonly limitComentarios = 5;

  // Formulario nuevo comentario
  nuevoComentarioControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });
  enviandoComentario = false;

  // Edición de comentario
  comentarioEnEdicionId = signal<string | null>(null);
  mensajeEdicionControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });
  guardandoEdicion = false;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) {
      this.noExiste.set(true);
      this.cargando.set(false);
      return;
    }
    this.cargarPublicacion();
    this.cargarComentarios();
  }

  cargarPublicacion() {
    this.cargando.set(true);
    this.noExiste.set(false);
    this.api.obtenerPorId(this.id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        if (e.status === 404) {
          this.noExiste.set(true);
        } else {
          this.dialog.open(ModalMensaje, {
            data: {
              titulo: 'Error',
              mensaje: e.error?.message ?? 'No se pudo cargar la publicación.',
            },
          });
        }
      },
    });
  }

  cargarComentarios() {
    this.cargandoComentarios.set(true);
    this.offsetComentarios = 0;
    this.api.listarComentarios(this.id, this.offsetComentarios, this.limitComentarios).subscribe({
      next: (res) => {
        this.comentarios.set(res.items);
        this.totalComentarios.set(res.total);
        this.offsetComentarios = res.items.length;
        this.cargandoComentarios.set(false);
      },
      error: () => {
        this.cargandoComentarios.set(false);
      },
    });
  }

  cargarMasComentarios() {
    if (this.cargandoMas()) return;
    this.cargandoMas.set(true);
    this.api.listarComentarios(this.id, this.offsetComentarios, this.limitComentarios).subscribe({
      next: (res) => {
        // Agregar los siguientes SIN quitar los anteriores y evitando duplicados
        this.comentarios.update((anteriores) => {
          const idsExistentes = new Set(anteriores.map((c) => c._id));
          const nuevos = res.items.filter((c) => !idsExistentes.has(c._id));
          return [...anteriores, ...nuevos];
        });
        this.totalComentarios.set(res.total);
        this.offsetComentarios += res.items.length;
        this.cargandoMas.set(false);
      },
      error: () => {
        this.cargandoMas.set(false);
      },
    });
  }

  alternarMeGusta() {
    const pub = this.publicacion();
    if (!pub) return;
    const peticion = pub.meGusta ? this.api.quitarMeGusta(pub._id) : this.api.darMeGusta(pub._id);
    peticion.subscribe({
      next: (r) => {
        this.publicacion.update((actual) =>
          actual ? { ...actual, likesCount: r.likesCount, meGusta: r.meGusta } : null,
        );
      },
      error: (e) => {
        const msg =
          e.status === 401
            ? 'Debés haber iniciado sesión para interactuar con las publicaciones.'
            : (e.error?.message ?? 'No se pudo registrar tu reacción.');
        this.dialog.open(ModalMensaje, { data: { titulo: 'Reacción no registrada', mensaje: msg } });
      },
    });
  }

  puedeEliminar(): boolean {
    const pub = this.publicacion();
    if (!pub) return false;
    return this.sesion.usuario()?._id === pub.autor._id;
  }

  eliminar() {
    const pub = this.publicacion();
    if (!pub) return;

    this.dialog
      .open(ModalMensaje, {
        data: {
          titulo: 'Eliminar publicación',
          mensaje: `¿Estás seguro de que querés eliminar "${pub.titulo}"? Esta acción no se puede deshacer.`,
          confirmar: true,
        },
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.api.eliminar(pub._id).subscribe({
          next: () => {
            this.dialog
              .open(ModalMensaje, {
                data: {
                  titulo: 'Publicación eliminada',
                  mensaje: 'La publicación fue eliminada correctamente.',
                },
              })
              .afterClosed()
              .subscribe(() => {
                this.router.navigate(['/publicaciones']);
              });
          },
          error: (e) => {
            const msg =
              e.status === 403
                ? 'No tenés permisos para eliminar esta publicación.'
                : (e.error?.message ?? 'No se pudo eliminar la publicación.');
            this.dialog.open(ModalMensaje, { data: { titulo: 'No se pudo eliminar', mensaje: msg } });
          },
        });
      });
  }

  enviarComentario() {
    const texto = this.nuevoComentarioControl.value.trim();
    if (!texto || this.enviandoComentario || this.nuevoComentarioControl.invalid) return;

    this.enviandoComentario = true;
    this.api.crearComentario(this.id, texto).subscribe({
      next: (comentarioCreado) => {
        this.enviandoComentario = false;
        this.nuevoComentarioControl.reset('');

        // Agregar al inicio evitando duplicados
        this.comentarios.update((anteriores) => {
          if (anteriores.some((c) => c._id === comentarioCreado._id)) return anteriores;
          return [comentarioCreado, ...anteriores];
        });
        this.totalComentarios.update((t) => t + 1);
        this.offsetComentarios += 1;

        // Actualizar contador en la publicación
        this.publicacion.update((p) =>
          p ? { ...p, comentariosCount: (p.comentariosCount ?? 0) + 1 } : null,
        );
      },
      error: (e) => {
        this.enviandoComentario = false;
        this.dialog.open(ModalMensaje, {
          data: {
            titulo: 'No se pudo enviar el comentario',
            mensaje: e.error?.message ?? 'Ocurrió un error al enviar el comentario.',
          },
        });
      },
    });
  }

  iniciarEdicion(c: Comentario) {
    this.comentarioEnEdicionId.set(c._id);
    this.mensajeEdicionControl.setValue(c.mensaje);
  }

  cancelarEdicion() {
    this.comentarioEnEdicionId.set(null);
    this.mensajeEdicionControl.reset('');
  }

  guardarEdicion(c: Comentario) {
    const nuevoTexto = this.mensajeEdicionControl.value.trim();
    if (!nuevoTexto || this.guardandoEdicion || this.mensajeEdicionControl.invalid) return;

    this.guardandoEdicion = true;
    this.api.actualizarComentario(this.id, c._id, nuevoTexto).subscribe({
      next: (comentarioActualizado) => {
        this.guardandoEdicion = false;
        this.comentarioEnEdicionId.set(null);
        this.comentarios.update((anteriores) =>
          anteriores.map((item) =>
            item._id === comentarioActualizado._id ? comentarioActualizado : item,
          ),
        );
      },
      error: (e) => {
        this.guardandoEdicion = false;
        this.dialog.open(ModalMensaje, {
          data: {
            titulo: 'No se pudo editar el comentario',
            mensaje: e.error?.message ?? 'Ocurrió un error al actualizar el comentario.',
          },
        });
      },
    });
  }

  esMiComentario(c: Comentario): boolean {
    return this.sesion.usuario()?._id === c.autor._id;
  }
}
