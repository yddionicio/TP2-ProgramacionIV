import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AdminUsersApi } from '../../../services/admin-users-api';
import { ModalMensaje } from '../../../shared/modal-mensaje/modal-mensaje';
import { PASSWORD_REGEX, passwordsIguales } from '../../../shared/validators/auth-validators';

const MAX_IMG_SIZE = 10 * 1024 * 1024; // 10 MB

@Component({
  selector: 'app-crear-usuario-modal',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: './crear-usuario-modal.html',
  styleUrl: './crear-usuario-modal.scss',
})
export class CrearUsuarioModal {
  private fb = inject(FormBuilder);
  private adminApi = inject(AdminUsersApi);
  private dialog = inject(MatDialog);
  private ref = inject(MatDialogRef<CrearUsuarioModal>);

  archivo: File | null = null;
  enviando = false;
  errorArchivo = '';

  form = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.]{3,20}$/)],
      ],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.maxLength(200)],
      perfil: ['usuario', Validators.required],
    },
    { validators: passwordsIguales },
  );

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.errorArchivo = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      this.errorArchivo = 'El archivo debe ser una imagen válida';
      this.archivo = null;
      input.value = '';
      return;
    }
    if (f.size > MAX_IMG_SIZE) {
      this.errorArchivo = 'La imagen no puede superar los 10 MB';
      this.archivo = null;
      input.value = '';
      return;
    }
    this.archivo = f;
  }

  quitarArchivo() {
    this.archivo = null;
    this.errorArchivo = '';
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => fd.append(k, v));
    if (this.archivo) fd.append('imagenPerfil', this.archivo);

    this.enviando = true;
    this.adminApi.crear(fd).subscribe({
      next: () => {
        this.enviando = false;
        this.ref.close(true);
      },
      error: (e) => {
        this.enviando = false;
        let msg = 'Ocurrió un error al crear el usuario.';
        if (e.status === 409) {
          msg = 'El correo o el nombre de usuario ya está registrado.';
        } else if (Array.isArray(e.error?.message)) {
          msg = e.error.message.join('. ');
        } else if (e.error?.message) {
          msg = e.error.message;
        }
        this.dialog.open(ModalMensaje, {
          data: {
            titulo: 'No se pudo crear el usuario',
            mensaje: msg,
          },
        });
      },
    });
  }
}
