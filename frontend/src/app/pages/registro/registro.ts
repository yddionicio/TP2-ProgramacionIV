import { Component, inject } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function passwordsIguales(g: AbstractControl): ValidationErrors | null {
  return g.get('password')?.value === g.get('repetirPassword')?.value
    ? null
    : { noCoinciden: true };
}

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  archivo: File | null = null;
  enviando = false;

  form = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.]{3,20}$/)]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.maxLength(200)],
    },
    { validators: passwordsIguales },
  );

  onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    if (file && !file.type.startsWith('image/')) {
      this.abrirModal('Archivo inválido', 'La imagen de perfil debe ser una imagen.');
      this.archivo = null;
      return;
    }
    this.archivo = file;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => fd.append(k, v));
    if (this.archivo) fd.append('imagenPerfil', this.archivo); // mismo nombre que en el FileInterceptor

    this.enviando = true;
    this.auth.registro(fd).subscribe({
      next: () => {
        this.enviando = false;
        this.dialog
          .open(ModalMensaje, {
            data: { titulo: 'Registro exitoso', mensaje: 'Tu cuenta fue creada. Ya podés iniciar sesión.' },
          })
          .afterClosed()
          .subscribe(() => this.router.navigate(['/login']));
      },
      error: (e) => {
        this.enviando = false;
        const msg = e.status === 0
          ? 'No se pudo conectar con el servidor.'
          : Array.isArray(e.error?.message)
            ? e.error.message.join('\n')
            : (e.error?.message ?? 'Ocurrió un error inesperado.');
        this.abrirModal('No se pudo registrar', msg);
      },
    });
  }

  private abrirModal(titulo: string, mensaje: string) {
    this.dialog.open(ModalMensaje, { data: { titulo, mensaje } });
  }
}