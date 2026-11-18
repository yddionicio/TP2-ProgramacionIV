import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ImagenFallbackDirective } from '../../../directives/imagen-fallback.directive';
import { ResaltarDirective } from '../../../directives/resaltar.directive';
import { Usuario } from '../../../models/usuario';
import { AdminUsersApi } from '../../../services/admin-users-api';
import { Sesion } from '../../../services/sesion';
import { ModalMensaje } from '../../../shared/modal-mensaje/modal-mensaje';
import { CrearUsuarioModal } from '../crear-usuario-modal/crear-usuario-modal';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    ImagenFallbackDirective,
    ResaltarDirective,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private adminApi = inject(AdminUsersApi);
  sesion = inject(Sesion);
  private dialog = inject(MatDialog);

  usuarios = signal<(Usuario & { activo: boolean })[]>([]);
  total = signal(0);
  offset = signal(0);
  limit = signal(10);
  cargando = signal(false);

  columnas: string[] = [
    'avatar',
    'nombre',
    'usuario',
    'correo',
    'perfil',
    'estado',
    'acciones',
  ];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.adminApi.listar(this.offset(), this.limit()).subscribe({
      next: (res) => {
        this.usuarios.set(res.items);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.dialog.open(ModalMensaje, {
          data: {
            titulo: 'Error',
            mensaje: 'No se pudieron cargar los usuarios.',
          },
        });
      },
    });
  }

  cambiarPagina(e: PageEvent) {
    this.offset.set(e.pageIndex * e.pageSize);
    this.limit.set(e.pageSize);
    this.cargar();
  }

  abrirCrear() {
    this.dialog
      .open(CrearUsuarioModal, { width: '560px' })
      .afterClosed()
      .subscribe((creado) => {
        if (creado) {
          this.cargar();
          this.dialog.open(ModalMensaje, {
            data: {
              titulo: 'Usuario creado',
              mensaje: 'El usuario fue registrado con éxito.',
            },
          });
        }
      });
  }

  esMismoUsuario(u: Usuario): boolean {
    return this.sesion.usuario()?._id === u._id;
  }

  alternarEstado(u: Usuario & { activo: boolean }) {
    if (this.esMismoUsuario(u)) return;

    const accion = u.activo ? 'deshabilitar' : 'habilitar';
    const titulo = u.activo ? 'Deshabilitar usuario' : 'Habilitar usuario';
    const mensaje = u.activo
      ? `¿Estás seguro de que querés deshabilitar a "${u.nombreUsuario}"? No podrá iniciar sesión.`
      : `¿Estás seguro de que querés rehabilitar a "${u.nombreUsuario}"?`;

    this.dialog
      .open(ModalMensaje, {
        data: {
          titulo,
          mensaje,
          confirmar: true,
        },
      })
      .afterClosed()
      .subscribe((confirma) => {
        if (!confirma) return;

        const req$ = u.activo
          ? this.adminApi.deshabilitar(u._id)
          : this.adminApi.habilitar(u._id);

        req$.subscribe({
          next: () => {
            this.cargar();
            this.dialog.open(ModalMensaje, {
              data: {
                titulo: 'Estado actualizado',
                mensaje: `El usuario fue ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'} con éxito.`,
              },
            });
          },
          error: (e) => {
            let errorMsg = `No se pudo ${accion} al usuario.`;
            if (e.error?.message) errorMsg = e.error.message;
            this.dialog.open(ModalMensaje, {
              data: { titulo: 'Error', mensaje: errorMsg },
            });
          },
        });
      });
  }
}
