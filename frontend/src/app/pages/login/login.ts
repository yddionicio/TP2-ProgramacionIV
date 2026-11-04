import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, RouterLink, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  enviando = false;

  form = this.fb.nonNullable.group({
    identificador: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
  });

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/publicaciones']);
      },
      error: (e) => {
        this.enviando = false;
        const msg = e.status === 0
          ? 'No se pudo conectar con el servidor.'
          : e.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : Array.isArray(e.error?.message)
              ? e.error.message.join('\n')
              : (e.error?.message ?? 'Ocurrió un error inesperado.');
        this.dialog.open(ModalMensaje, { data: { titulo: 'No se pudo iniciar sesión', mensaje: msg } });
      },
    });
  }
}