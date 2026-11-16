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
import { Sesion } from '../../services/sesion';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private sesion = inject(Sesion);
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
      next: (usuario) => {
        this.enviando = false;
        this.sesion.establecer(usuario);
        this.router.navigate(['/publicaciones']);
      },
      error: (e) => {
        this.enviando = false;
        let msg = 'Ocurrió un error inesperado al iniciar sesión.';
        if (e.status === 0) {
          msg = 'No pudimos comunicarnos con el servidor. Por favor, comprobá tu conexión a internet e intentá nuevamente.';
        } else if (e.status === 401) {
          msg = 'Correo, usuario o contraseña incorrectos. Por favor, verificá tus datos e intentá de nuevo.';
        } else if (Array.isArray(e.error?.message)) {
          msg = e.error.message.join('\n');
        } else if (e.error?.message) {
          msg = e.error.message;
        }
        this.dialog.open(ModalMensaje, { data: { titulo: 'No se pudo iniciar sesión', mensaje: msg } });
      },
    });
  }
}
